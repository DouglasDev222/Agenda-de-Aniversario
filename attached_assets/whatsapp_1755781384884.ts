import makeWASocket, {
  Browsers,
  useMultiFileAuthState,
  DisconnectReason,
  WAMessage,
  fetchLatestWaWebVersion,
  WASocket,
} from "baileys";
import qrcode from "qrcode-terminal";
import QRCode from "qrcode";
import { Boom } from "@hapi/boom";
import { logger } from "./utils/logger";
import { FormattedMessage, getMessage } from "./utils/message";
import fs from "fs";
import path from "path";

export class WhatsAppService {
  private sock: WASocket | null = null;
  private qrCodeData: string | null = null;
  private connectionStatus: string = "disconnected";
  private isConnecting: boolean = false;

  constructor() {
    // Não inicializar automaticamente para evitar loops
  }

  public async initWASocket(): Promise<void> {
    if (this.isConnecting) {
      logger.info("Já está tentando conectar...");
      return;
    }

    this.isConnecting = true;
    
    try {
      const { state, saveCreds } = await useMultiFileAuthState("auth");

      const { version, isLatest } = await fetchLatestWaWebVersion({});
      logger.info(
        `Versão atual do WaWeb: ${version.join(".")} | ${
          isLatest ? "Versão mais recente" : "Está desatualizado"
        }`
      );

      this.sock = makeWASocket({
        auth: state,
        browser: Browsers.appropriate("Desktop"),
        printQRInTerminal: true,
        version: version,
        defaultQueryTimeoutMs: 0,
      });

      this.sock.ev.on(
        "connection.update",
        async ({ connection, lastDisconnect, qr }: any) => {
          logger.info(
            `Socket Connection Update: ${connection || ""}`
          );

          switch (connection) {
            case "close":
              this.connectionStatus = "disconnected";
              logger.error("Conexão fechada");
              
              const shouldReconnect =
                (lastDisconnect.error as Boom)?.output?.statusCode !==
                DisconnectReason.loggedOut;

              if (shouldReconnect) {
                this.isConnecting = false;
                this.qrCodeData = null; // Limpar QR Code antigo
                setTimeout(() => this.initWASocket(), 5000);
              } else if (lastDisconnect.error?.output?.statusCode === DisconnectReason.loggedOut || lastDisconnect.error?.message === 'invalid session token') {
                logger.info('Sessão inválida ou desconectada. Limpando credenciais e forçando novo QR Code.');
                const authPath = path.resolve(__dirname, '../../auth');
                if (fs.existsSync(authPath)) {
                  fs.rmSync(authPath, { recursive: true, force: true });
                  logger.info('Pasta auth/ removida.');
                }
                this.isConnecting = false;
                this.qrCodeData = null; // Limpar QR Code antigo
                setTimeout(() => this.initWASocket(), 1000); // Reconectar mais rápido para gerar QR
              }
              break;
            case "open":
              this.connectionStatus = "connected";
              this.qrCodeData = null;
              logger.info("Bot Conectado");
              break;
            case "connecting":
              this.connectionStatus = "connecting";
              break;
          }

          if (qr !== undefined) {
            this.qrCodeData = qr;
            qrcode.generate(qr, { small: true });
            logger.info("QR Code gerado");
          }
        }
      );

      this.sock.ev.on("messages.upsert", ({ messages }: { messages: WAMessage[] }) => {
        for (let index = 0; index < messages.length; index++) {
          const message = messages[index];

          if (!message || !message.key) continue;

          const isGroup = message.key.remoteJid?.endsWith("@g.us");
          const isStatus = message.key.remoteJid === "status@broadcast";

          if (isGroup || isStatus) return;

          const formattedMessage: FormattedMessage | undefined = getMessage(message);
          if (formattedMessage !== undefined) {
            logger.info(`Mensagem recebida de ${formattedMessage.pushName}: ${formattedMessage.content}`);
          }
        }
      });

      this.sock.ev.on("creds.update", saveCreds);
      this.isConnecting = false;
    } catch (error: any) {
      this.isConnecting = false;
      logger.error("Erro ao inicializar socket:", error?.message || error);
    }
  }

  public async sendMessage(number: string, message: string): Promise<boolean> {
    if (!this.sock || this.connectionStatus !== "connected") {
      throw new Error("WhatsApp não está conectado");
    }

    try {
      const formattedNumber = number.includes("@s.whatsapp.net") 
        ? number 
        : `${number}@s.whatsapp.net`;
      
      await this.sock.sendMessage(formattedNumber, { text: message });
      logger.info(`Mensagem enviada para ${number}`);
      return true;
    } catch (error: any) {
      logger.error("Erro ao enviar mensagem:", error?.message || error);
      throw error;
    }
  }

  public getConnectionStatus(): string {
    return this.connectionStatus;
  }

  public async getQRCode(): Promise<string | null> {
    if (this.qrCodeData) {
      try {
        const qrCodeImage = await QRCode.toDataURL(this.qrCodeData);
        return qrCodeImage;
      } catch (error: any) {
        logger.error("Erro ao gerar QR Code:", error?.message || error);
        return null;
      }
    }
    return null;
  }

  public getQRCodeText(): string | null {
    return this.qrCodeData;
  }

  public async startConnection(): Promise<void> {
    if (!this.isConnecting && this.connectionStatus === "disconnected") {
      await this.initWASocket();
    }
  }
}

export const whatsappService = new WhatsAppService();

