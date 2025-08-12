
import fetch from 'node-fetch';

export class WhatsAppBusinessAPIService {
  private baseUrl: string;
  private accessToken: string;
  private phoneNumberId: string;

  constructor() {
    this.baseUrl = 'https://graph.facebook.com/v18.0';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    if (!this.accessToken || !this.phoneNumberId) {
      console.log('📱 WhatsApp Business API não configurado - usando modo simulação');
      console.log(`💬 Simulando envio para ${to}: ${message}`);
      return true;
    }

    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to.replace(/\D/g, ''), // Remove apenas formatação, mantém código do país
          type: 'text',
          text: {
            body: message
          }
        })
      });

      if (response.ok) {
        console.log(`✅ Mensagem enviada via WhatsApp Business API para ${to}`);
        return true;
      } else {
        const error = await response.text();
        console.error('❌ Erro na WhatsApp Business API:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem via Business API:', error);
      return false;
    }
  }

  isConfigured(): boolean {
    return !!(this.accessToken && this.phoneNumberId);
  }
}
