import { baileysWhatsAppService } from './baileys-whatsapp';
import { WhatsAppBusinessAPIService } from './whatsapp-business-api.js';

export class WhatsAppService {
  private businessAPI: WhatsAppBusinessAPIService;
  private simulateMode = false;

  constructor() {
    this.businessAPI = new WhatsAppBusinessAPIService();
  }

  async initialize(): Promise<void> {
    console.log('🚀 Inicializando WhatsApp Service com Baileys...');

    // Check if Business API is configured first
    if (this.businessAPI.isConfigured()) {
      console.log('✅ WhatsApp Business API configurada - usando API oficial');
      return;
    }

    if (this.simulateMode) {
      console.log('✅ WhatsApp Service initialized in simulation mode');
      return;
    }

    // Initialize Baileys
    await baileysWhatsAppService.initialize();
  }

  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    console.log(`🎯 ENVIO DE MENSAGEM INICIADO:`);
    console.log(`📞 Número de destino: ${phoneNumber}`);
    console.log(`💬 Mensagem: ${message.substring(0, 100)}...`);

    // Priority: Business API > Baileys > Simulation
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

    // Use Baileys
    return await baileysWhatsAppService.sendMessage(phoneNumber, message);
  }

  async testConnection(): Promise<{ connected: boolean; status: string; simulateMode: boolean; realConnection: boolean }> {
    // Business API check
    if (this.businessAPI && this.businessAPI.isConfigured()) {
      console.log('🔍 Testando conexão WhatsApp Business API');
      const isConfigured = this.businessAPI.isConfigured();
      return {
        connected: isConfigured,
        status: isConfigured ? 'connected' : 'disconnected',
        simulateMode: false,
        realConnection: isConfigured
      };
    }

    // Simulation mode check
    if (this.simulateMode) {
      console.log('🔍 Testando conexão WhatsApp (modo simulação)');
      return {
        connected: true,
        status: 'connected',
        simulateMode: true,
        realConnection: false
      };
    }

    // Baileys connection test
    const baileysStatus = await baileysWhatsAppService.testConnection();
    return {
      connected: baileysStatus.connected,
      status: baileysStatus.status,
      simulateMode: false,
      realConnection: baileysStatus.realConnection
    };
  }

  async close(): Promise<void> {
    await baileysWhatsAppService.close();
  }

  getConnectionStatus(): { 
    isConnected: boolean; 
    status: string; 
    qrCode: string | null; 
    simulateMode: boolean;
    realConnection: boolean;
  } {
    // Business API status
    if (this.businessAPI && this.businessAPI.isConfigured()) {
      return {
        isConnected: true,
        status: 'connected',
        qrCode: null,
        simulateMode: false,
        realConnection: true
      };
    }

    // Simulation mode status
    if (this.simulateMode) {
      return {
        isConnected: true,
        status: 'connected',
        qrCode: null,
        simulateMode: true,
        realConnection: false
      };
    }

    // Baileys status
    const status = baileysWhatsAppService.getConnectionStatus();
    return {
      ...status,
      simulateMode: false
    };
  }

  async refreshQRCode(): Promise<string | null> {
    if (this.simulateMode) {
      return null;
    }
    return await baileysWhatsAppService.refreshQRCode();
  }

  async enableSimulationMode(): Promise<void> {
    this.simulateMode = true;
    await baileysWhatsAppService.close();
    console.log('✅ Modo simulação ativado');
  }

  async enableRealMode(): Promise<void> {
    console.log('🔄 Desabilitando modo simulação - preparando conexão real com Baileys');
    this.simulateMode = false;
    await baileysWhatsAppService.enableRealMode();
    console.log('📱 Modo real ativado - use o endpoint /api/whatsapp/connect para conectar');
  }

  async forceCleanAuth(): Promise<void> {
    console.log('🧹 Forçando limpeza da autenticação WhatsApp...');
    
    if (this.simulateMode) {
      console.log('⚠️ Modo simulação ativado - nenhuma limpeza necessária');
      return;
    }

    await baileysWhatsAppService.forceCleanAuth();
  }

  // Additional Baileys methods
  async getProfilePicture(phoneNumber: string): Promise<string | null> {
    if (this.simulateMode) return null;

    let formattedNumber = phoneNumber.replace(/\D/g, '');
    if (!formattedNumber.startsWith('55')) {
      formattedNumber = '55' + formattedNumber;
    }
    const jid = formattedNumber + '@s.whatsapp.net';

    return await baileysWhatsAppService.getProfilePicture(jid);
  }

  async getStatus(phoneNumber: string): Promise<string | null> {
    if (this.simulateMode) return null;

    let formattedNumber = phoneNumber.replace(/\D/g, '');
    if (!formattedNumber.startsWith('55')) {
      formattedNumber = '55' + formattedNumber;
    }
    const jid = formattedNumber + '@s.whatsapp.net';

    return await baileysWhatsAppService.getStatus(jid);
  }

  async sendMediaFromUrl(phoneNumber: string, url: string, caption?: string): Promise<boolean> {
    if (this.simulateMode) {
      console.log(`📱 MODO SIMULAÇÃO - Enviando mídia para ${phoneNumber}: ${url}`);
      return true;
    }

    let formattedNumber = phoneNumber.replace(/\D/g, '');
    if (!formattedNumber.startsWith('55')) {
      formattedNumber = '55' + formattedNumber;
    }
    const jid = formattedNumber + '@s.whatsapp.net';

    return await baileysWhatsAppService.sendMediaFromUrl(jid, url, caption);
  }

  async sendLocation(phoneNumber: string, latitude: number, longitude: number, name?: string): Promise<boolean> {
    if (this.simulateMode) {
      console.log(`📱 MODO SIMULAÇÃO - Enviando localização para ${phoneNumber}: ${latitude}, ${longitude}`);
      return true;
    }

    let formattedNumber = phoneNumber.replace(/\D/g, '');
    if (!formattedNumber.startsWith('55')) {
      formattedNumber = '55' + formattedNumber;
    }
    const jid = formattedNumber + '@s.whatsapp.net';

    return await baileysWhatsAppService.sendLocation(jid, latitude, longitude, name);
  }
}

export const whatsappService = new WhatsAppService();