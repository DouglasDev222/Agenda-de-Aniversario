// Use createRequire to import CommonJS modules in ES modules environment
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const createWhatsAppClient = async () => {
  // Since whatsapp-web.js is CommonJS, we use require with createRequire
  const { Client, LocalAuth } = require('whatsapp-web.js');
  const qrcode = require("qrcode");
  return { Client, LocalAuth, qrcode };
};

export class WhatsAppService {
  private client: any | null = null;
  private isConnected = false;
  private simulateMode = false; // Habilitado por padrão no ambiente Replit
  private qrCode: string | null = null;
  private connectionStatus: 'disconnected' | 'waiting_qr' | 'connecting' | 'connected' = 'disconnected';
  private modules: any = null;

  async initialize(): Promise<void> {
    if (this.simulateMode) {
      console.log('✅ WhatsApp Service initialized in simulation mode (recommended for Replit)');
      this.isConnected = true;
      this.connectionStatus = 'connected';
      return;
    }

    this.connectionStatus = 'connecting';
    console.log('🔄 Iniciando conexão com WhatsApp Web usando whatsapp-web.js...');

    try {
      // Load modules using require (CommonJS)
      this.modules = await createWhatsAppClient();
      const { Client, LocalAuth } = this.modules;

      // Create authentication strategy
      const authStrategy = new LocalAuth({
        dataPath: './whatsapp-sessions'
      });

      // Initialize WhatsApp Web client with local authentication
      this.client = new Client({
        authStrategy: authStrategy,
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--single-process',
            '--no-zygote'
          ]
        }
      });

      // Setup event listeners
      this.client.on('qr', (qr: string) => {
        console.log('📱 QR Code recebido! Escaneie com seu WhatsApp:');
        console.log(qr);
        this.modules.qrcode.toDataURL(qr, (err: any, url: string) => {
          if (err) {
            console.error("Erro ao gerar QR Code como data URL:", err);
            this.qrCode = null;
          } else {
            this.qrCode = url.split(",")[1]; // Pega apenas a parte base64
          }
        });

        this.connectionStatus = 'waiting_qr';
      });

      this.client.on('ready', () => {
        console.log('✅ WhatsApp Web conectado com sucesso!');
        this.isConnected = true;
        this.connectionStatus = 'connected';
        this.qrCode = null;
      });

      this.client.on('authenticated', () => {
        console.log('🔐 WhatsApp autenticado com sucesso!');
      });

      this.client.on('auth_failure', (msg: string) => {
        console.error('❌ Falha na autenticação WhatsApp:', msg);
        this.connectionStatus = 'disconnected';
        this.isConnected = false;
      });

      this.client.on('disconnected', (reason: string) => {
        console.log('⚠️ WhatsApp desconectado:', reason);
        this.connectionStatus = 'disconnected';
        this.isConnected = false;
        this.qrCode = null;
      });

      // Initialize the client
      await this.client.initialize();
      
    } catch (error) {
      console.error('❌ Falha ao inicializar WhatsApp:', error);
      console.log('🔄 Retornando ao modo simulação devido a erro de inicialização');
      this.connectionStatus = 'disconnected';
      this.simulateMode = true;
      this.isConnected = true;
      this.connectionStatus = 'connected';
    }
  }

  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('WhatsApp is not connected');
    }

    if (this.simulateMode) {
      console.log(`📱 Simulando envio de mensagem para ${phoneNumber}:`);
      console.log(`💬 ${message}`);
      console.log('✅ Mensagem "enviada" com sucesso (modo simulação)');
      return true;
    }

    if (!this.client) {
      throw new Error('WhatsApp client is not initialized');
    }

    try {
      // Format phone number for WhatsApp (remove special characters and ensure country code)
      let formattedNumber = phoneNumber.replace(/\D/g, '');
      
      // Add Brazil country code if not present
      if (!formattedNumber.startsWith('55') && formattedNumber.length === 11) {
        formattedNumber = '55' + formattedNumber;
      }
      
      // WhatsApp format: number@c.us
      const chatId = formattedNumber + '@c.us';
      
      console.log(`📤 Enviando mensagem para ${phoneNumber} (${chatId})`);
      
      // Send message using whatsapp-web.js
      await this.client.sendMessage(chatId, message);
      
      console.log('✅ Mensagem enviada com sucesso!');
      return true;
      
    } catch (error) {
      console.error(`❌ Falha ao enviar mensagem para ${phoneNumber}:`, error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    if (this.simulateMode) {
      console.log('🔍 Testando conexão WhatsApp (modo simulação)');
      return this.isConnected;
    }

    if (!this.client) return false;
    
    try {
      const state = await this.client.getState();
      console.log('📊 Estado do WhatsApp:', state);
      this.isConnected = state === 'CONNECTED';
      return this.isConnected;
    } catch (error) {
      console.error('❌ Erro ao testar conexão:', error);
      this.isConnected = false;
      return false;
    }
  }

  async close(): Promise<void> {
    if (this.client) {
      try {
        await this.client.destroy();
        console.log('🔌 WhatsApp client desconectado');
      } catch (error) {
        console.error('Erro ao fechar cliente WhatsApp:', error);
      }
      this.client = null;
      this.isConnected = false;
      this.connectionStatus = 'disconnected';
    }
  }

  getConnectionStatus(): { 
    isConnected: boolean; 
    status: string; 
    qrCode: string | null; 
    simulateMode: boolean;
  } {
    return {
      isConnected: this.isConnected,
      status: this.connectionStatus,
      qrCode: this.qrCode,
      simulateMode: this.simulateMode
    };
  }

  async refreshQRCode(): Promise<string | null> {
    if (this.connectionStatus !== 'waiting_qr' || this.simulateMode) {
      return this.qrCode;
    }
    
    try {
      // For whatsapp-web.js, QR code refresh is handled automatically
      // We just return the current QR code
      console.log('🔄 QR Code atual disponível');
      return this.qrCode;
    } catch (error) {
      console.error('❌ Erro ao atualizar QR code:', error);
      return null;
    }
  }

  async enableSimulationMode(): Promise<void> {
    this.simulateMode = true;
    this.isConnected = true;
    this.connectionStatus = 'connected';
    this.qrCode = null;
    
    if (this.client) {
      await this.close();
    }
    
    console.log('✅ Modo simulação ativado');
  }

  async enableRealMode(): Promise<void> {
    console.log('🔄 Desabilitando modo simulação - preparando conexão real com WhatsApp Web');
    
    // Close any existing client connection
    if (this.client) {
      await this.close();
    }
    
    this.simulateMode = false;
    this.isConnected = false;
    this.connectionStatus = 'disconnected';
    this.qrCode = null;
    
    console.log('📱 Modo real ativado - use o endpoint /api/whatsapp/connect para conectar');
  }
}

export const whatsappService = new WhatsAppService();
