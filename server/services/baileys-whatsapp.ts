
import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState, 
  fetchLatestBaileysVersion,
  WAMessageKey,
  proto
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import P from 'pino';
import qrcode from 'qrcode-terminal';
import QRCode from 'qrcode';

export class BaileysWhatsAppService {
  private sock: any = null;
  private isConnected = false;
  private qrCodeString: string | null = null;
  private connectionStatus: 'disconnected' | 'waiting_qr' | 'connecting' | 'connected' = 'disconnected';
  private logger = P({ timestamp: () => `,"time":"${new Date().toJSON()}"` }, P.destination('./wa-logs.txt'));
  private businessAPI: any;

  constructor() {
    this.logger.level = 'trace';
  }

  async initialize(): Promise<void> {
    console.log('🚀 Inicializando Baileys WhatsApp Service...');
    
    try {
      this.connectionStatus = 'connecting';
      
      // Fetch latest version of WA Web
      const { version, isLatest } = await fetchLatestBaileysVersion();
      console.log(`Using WA v${version.join('.')}, isLatest: ${isLatest}`);

      // Use multi file auth state
      const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');

      // Create socket
      this.sock = makeWASocket({
        version,
        logger: this.logger,
        printQRInTerminal: false,
        auth: state,
        generateHighQualityLinkPreview: true,
      });

      // Handle connection updates
      this.sock.ev.on('connection.update', (update: any) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
          console.log('📱 QR Code recebido!');
          this.connectionStatus = 'waiting_qr';
          qrcode.generate(qr, { small: true });
          
          // Generate QR code as data URL for web display
          try {
            this.qrCodeString = await QRCode.toDataURL(qr);
            console.log('📱 QR Code gerado para exibição web');
          } catch (qrError) {
            console.error('❌ Erro ao gerar QR code para web:', qrError);
            this.qrCodeString = qr; // fallback to raw string
          }
        }

        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          console.log('❌ Conexão fechada devido a', lastDisconnect?.error, ', reconectando:', shouldReconnect);
          
          this.isConnected = false;
          this.connectionStatus = 'disconnected';
          this.qrCodeString = null;

          // Reconnect if not logged out
          if (shouldReconnect) {
            setTimeout(() => this.initialize(), 3000);
          }
        } else if (connection === 'open') {
          console.log('✅ WhatsApp conectado com sucesso!');
          this.isConnected = true;
          this.connectionStatus = 'connected';
          this.qrCodeString = null;
        }
      });

      // Save credentials when updated
      this.sock.ev.on('creds.update', saveCreds);

      // Handle messages (optional for future features)
      this.sock.ev.on('messages.upsert', (m: any) => {
        console.log('📨 Nova mensagem recebida:', JSON.stringify(m, undefined, 2));
      });

    } catch (error) {
      console.error('❌ Erro ao inicializar Baileys:', error);
      this.connectionStatus = 'disconnected';
      this.isConnected = false;
    }
  }

  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    if (!this.isConnected || !this.sock) {
      throw new Error('WhatsApp is not connected');
    }

    console.log(`🎯 ENVIO DE MENSAGEM INICIADO:`);
    console.log(`📞 Número de destino: ${phoneNumber}`);
    console.log(`💬 Mensagem: ${message.substring(0, 100)}...`);

    try {
      // Format phone number
      let formattedNumber = phoneNumber.replace(/\D/g, '');
      console.log(`🔄 Número original: ${phoneNumber}, Limpo: ${formattedNumber}`);

      // Add Brazil country code if not present
      if (!formattedNumber.startsWith('55')) {
        formattedNumber = '55' + formattedNumber;
        console.log(`🇧🇷 Adicionado código do país: ${formattedNumber}`);
      }

      // Format to WhatsApp ID
      const jid = formattedNumber + '@s.whatsapp.net';
      console.log(`📱 JID final: ${jid}`);

      // Check if number is registered on WhatsApp
      try {
        const [result] = await this.sock.onWhatsApp(jid);
        if (!result.exists) {
          console.log(`⚠️ Número ${formattedNumber} NÃO está registrado no WhatsApp`);
          return false;
        }
        console.log(`✅ Número ${formattedNumber} está registrado no WhatsApp`);
      } catch (checkError) {
        console.log(`⚠️ Não foi possível verificar se o número está no WhatsApp:`, checkError);
      }

      console.log(`📤 Enviando mensagem via Baileys para ${phoneNumber} (${jid})`);

      // Send message
      const sentMessage = await this.sock.sendMessage(jid, { text: message });

      console.log(`✅ Mensagem enviada com sucesso para ${phoneNumber}!`);
      console.log(`📋 ID da mensagem: ${sentMessage.key.id}`);
      console.log(`🕐 Timestamp: ${sentMessage.messageTimestamp}`);

      return true;

    } catch (error) {
      console.error(`❌ Falha ao enviar mensagem para ${phoneNumber}:`, error);
      return false;
    }
  }

  async testConnection(): Promise<{ connected: boolean; status: string; realConnection: boolean }> {
    console.log('🔍 Testando conexão WhatsApp Baileys');
    
    try {
      if (!this.sock || !this.isConnected) {
        return {
          connected: false,
          status: 'disconnected',
          realConnection: false
        };
      }

      // Try to get user info to verify connection
      const user = this.sock.user;
      console.log('📊 Usuário conectado:', user?.name || user?.id);
      
      return {
        connected: true,
        status: 'connected',
        realConnection: true
      };
    } catch (error) {
      console.error('❌ Erro ao testar conexão:', error);
      return {
        connected: false,
        status: 'disconnected',
        realConnection: false
      };
    }
  }

  async close(): Promise<void> {
    if (this.sock) {
      try {
        await this.sock.logout();
        console.log('🔌 WhatsApp Baileys desconectado');
      } catch (error) {
        console.error('Erro ao fechar cliente Baileys:', error);
      }
      this.sock = null;
      this.isConnected = false;
      this.connectionStatus = 'disconnected';
    }
  }

  getConnectionStatus(): { 
    isConnected: boolean; 
    status: string; 
    qrCode: string | null; 
    realConnection: boolean;
  } {
    return {
      isConnected: this.isConnected,
      status: this.connectionStatus,
      qrCode: this.qrCodeString,
      realConnection: this.isConnected
    };
  }

  async refreshQRCode(): Promise<string | null> {
    if (this.connectionStatus !== 'waiting_qr') {
      return this.qrCodeString;
    }

    try {
      console.log('🔄 QR Code atual disponível');
      return this.qrCodeString;
    } catch (error) {
      console.error('❌ Erro ao atualizar QR code:', error);
      return null;
    }
  }

  async enableRealMode(): Promise<void> {
    console.log('🔄 Baileys sempre opera em modo real - reconectando...');
    
    if (this.sock) {
      await this.close();
    }
    
    this.isConnected = false;
    this.connectionStatus = 'disconnected';
    this.qrCodeString = null;
    
    console.log('📱 Pronto para conectar - use o endpoint /api/whatsapp/connect');
  }

  // Métodos adicionais do Baileys
  async getProfilePicture(jid: string): Promise<string | null> {
    try {
      const url = await this.sock.profilePictureUrl(jid);
      return url;
    } catch (error) {
      console.error('Erro ao obter foto do perfil:', error);
      return null;
    }
  }

  async getStatus(jid: string): Promise<string | null> {
    try {
      const status = await this.sock.fetchStatus(jid);
      return status?.status || null;
    } catch (error) {
      console.error('Erro ao obter status:', error);
      return null;
    }
  }

  async markAsRead(key: WAMessageKey): Promise<void> {
    try {
      await this.sock.readMessages([key]);
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  }

  async sendTyping(jid: string, typing: boolean = true): Promise<void> {
    try {
      await this.sock.sendPresenceUpdate(typing ? 'composing' : 'paused', jid);
    } catch (error) {
      console.error('Erro ao enviar status de digitação:', error);
    }
  }

  async sendLocation(jid: string, latitude: number, longitude: number, name?: string): Promise<boolean> {
    try {
      await this.sock.sendMessage(jid, {
        location: {
          degreesLatitude: latitude,
          degreesLongitude: longitude,
          name: name
        }
      });
      return true;
    } catch (error) {
      console.error('Erro ao enviar localização:', error);
      return false;
    }
  }

  async sendMediaFromUrl(jid: string, url: string, caption?: string): Promise<boolean> {
    try {
      await this.sock.sendMessage(jid, {
        image: { url },
        caption
      });
      return true;
    } catch (error) {
      console.error('Erro ao enviar mídia:', error);
      return false;
    }
  }
}

export const baileysWhatsAppService = new BaileysWhatsAppService();
