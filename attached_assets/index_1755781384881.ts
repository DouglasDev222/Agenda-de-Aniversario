import 'dotenv/config';
import express from "express";
import cors from "cors";
import { logger } from "./utils/logger";
import whatsappRoutes from "./routes/whatsapp";
import { authenticateApiKey } from "./middleware/auth";

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de log
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Rotas
app.use("/api", authenticateApiKey, whatsappRoutes);

// Rota de health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "WhatsApp API está funcionando",
    version: "1.0.0",
    endpoints: {
      "POST /api/connect": "Iniciar conexão com WhatsApp",
      "POST /api/send-message": "Enviar mensagem",
      "GET /api/status": "Verificar status da conexão",
      "GET /api/qrcode": "Obter QR Code para conexão"
    }
  });
});

// Middleware de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error("Erro não tratado:", err);
  res.status(500).json({
    success: false,
    error: "Erro interno do servidor"
  });
});

// Middleware para rotas não encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Rota não encontrada"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
  logger.info(`📱 WhatsApp API disponível em http://localhost:${PORT}`);
  logger.info(`📋 Documentação disponível em http://localhost:${PORT}`);
});

export default app;

