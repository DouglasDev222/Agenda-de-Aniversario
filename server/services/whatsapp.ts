// Use createRequire to import CommonJS modules in ES modules environment
import { createRequire } from 'module';
import { WhatsAppBusinessAPIService } from './whatsapp-business-api.js';
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
  private businessAPI: WhatsAppBusinessAPIService;

  async initialize(): Promise<void> {
    this.businessAPI = new WhatsAppBusinessAPIService();
    
    // Se a Business API estiver configurada, use-a em vez do modo simulação
    if (this.businessAPI.isConfigured()) {
      console.log('✅ WhatsApp Business API configurada - usando API oficial');
      this.simulateMode = false;
      this.isConnected = true;
      this.connectionStatus = 'connected';
      return;
    }
    
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
            this.qrCode = url; // Atribui a URL completa
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

    console.log(`🎯 ENVIO DE MENSAGEM INICIADO:`);
    console.log(`📞 Número de destino: ${phoneNumber}`);
    console.log(`💬 Mensagem: ${message.substring(0, 100)}...`);

    // Prioridade: Business API > WhatsApp-Web.js > Simulação
    if (this.businessAPI && this.businessAPI.isConfigured()) {
      console.log(`🔄 Usando WhatsApp Business API para envio`);
      return await this.businessAPI.sendMessage(phoneNumber, message);
    }

    if (this.simulateMode) {
      console.log(`📱 MODO SIMULAÇÃO - Enviando para ${phoneNumber}:`);
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
      console.log(`🔄 Número original: ${phoneNumber}, Limpo: ${formattedNumber}`);

      // Validação e formatação específica para números brasileiros
      if (formattedNumber.length === 10 || formattedNumber.length === 11) {
        // Número brasileiro sem código do país
        if (formattedNumber.length === 10) {
          // Celular antigo sem 9 - adicionar o 9
          if (['11', '12', '13', '14', '15', '16', '17', '18', '19', '21', '22', '24', '27', '28', '31', '32', '33', '34', '35', '37', '38', '41', '42', '43', '44', '45', '46', '47', '48', '49', '51', '53', '54', '55', '61', '62', '63', '64', '65', '66', '67', '68', '69', '71', '73', '74', '75', '77', '79', '81', '82', '83', '84', '85', '86', '87', '88', '89', '91', '92', '93', '94', '95', '96', '97', '98', '99'].includes(formattedNumber.substring(0, 2))) {
            const ddd = formattedNumber.substring(0, 2);
            const numero = formattedNumber.substring(2);
            formattedNumber = ddd + '9' + numero;
            console.log(`📱 Adicionado 9º dígito: ${formattedNumber}`);
          }
        }
        formattedNumber = '55' + formattedNumber;
        console.log(`🇧🇷 Adicionando código do Brasil: ${formattedNumber}`);
      } else if (formattedNumber.length === 12 && formattedNumber.startsWith('55')) {
        // Número brasileiro com código do país mas sem 9º dígito
        const ddd = formattedNumber.substring(2, 4);
        const numero = formattedNumber.substring(4);
        if (numero.length === 8) {
          formattedNumber = '55' + ddd + '9' + numero;
          console.log(`📱 Adicionado 9º dígito no número com código do país: ${formattedNumber}`);
        }
      } else if (formattedNumber.length === 13 && formattedNumber.startsWith('55')) {
        // Número brasileiro completo - verificar se tem 9º dígito
        const ddd = formattedNumber.substring(2, 4);
        const primeiroDigito = formattedNumber.substring(4, 5);
        if (primeiroDigito !== '9') {
          const numero = formattedNumber.substring(4);
          formattedNumber = '55' + ddd + '9' + numero;
          console.log(`📱 Adicionado 9º dígito no número completo: ${formattedNumber}`);
        }
      }

      // WhatsApp format: number@c.us
      const chatId = formattedNumber + '@c.us';
      console.log(`📱 Chat ID final: ${chatId}`);

      // Verificar se o número existe no WhatsApp antes de enviar
      try {
        const numberId = await this.client.getNumberId(chatId);
        if (numberId) {
          console.log(`✅ Número ${formattedNumber} está registrado no WhatsApp`);
        } else {
          console.log(`⚠️ Número ${formattedNumber} NÃO está registrado no WhatsApp`);
          return false;
        }
      } catch (checkError) {
        console.log(`⚠️ Não foi possível verificar se o número está no WhatsApp:`, checkError);
      }

      console.log(`📤 Enviando mensagem via WhatsApp-Web.js para ${phoneNumber} (${chatId})`);

      // Send message using whatsapp-web.js
      const result = await this.client.sendMessage(chatId, message);

      console.log(`✅ Mensagem enviada com sucesso para ${phoneNumber}!`);
      console.log(`📋 ID da mensagem: ${result.id}`);
      console.log(`🕐 Timestamp: ${result.timestamp}`);
      
      return true;

    } catch (error) {
      console.error(`❌ Falha ao enviar mensagem para ${phoneNumber}:`, error);
      
      // Log detalhado do erro
      if (error.message) {
        console.error(`❌ Mensagem do erro: ${error.message}`);
      }
      
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    // Se estiver usando Business API, verificar se está configurada
    if (this.businessAPI && this.businessAPI.isConfigured()) {
      console.log('🔍 Testando conexão WhatsApp Business API');
      return this.businessAPI.isConfigured();
    }

    // Se estiver em modo simulação, retornar false para indicar que não há conexão real
    if (this.simulateMode) {
      console.log('🔍 Testando conexão WhatsApp (modo simulação - sem conexão real)');
      return false;
    }

    if (!this.client) {
      console.log('❌ Cliente WhatsApp não inicializado');
      return false;
    }

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
    realConnection: boolean;
  } {
    // Verificar se há uma conexão real (Business API ou WhatsApp-Web.js)
    const hasRealConnection = (this.businessAPI && this.businessAPI.isConfigured()) || 
                              (!this.simulateMode && this.isConnected);

    return {
      isConnected: this.isConnected,
      status: this.connectionStatus,
      qrCode: this.qrCode,
      simulateMode: this.simulateMode,
      realConnection: hasRealConnection
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
