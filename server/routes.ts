import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, storagePromise } from "./storage";
import { whatsappService } from "./services/whatsapp";
import { schedulerService } from "./services/scheduler";
import { insertEmployeeSchema, insertContactSchema, insertSettingsSchema, insertUserSchema, loginSchema } from "@shared/schema";
import { authenticateToken, requireAdmin, requireManagement, generateToken } from "./middleware/auth";
import { eq, like, or, and, count, desc, asc, sql } from "drizzle-orm";
import { messages } from "@shared/schema"; // Assuming messagesTable is exported from @shared/schema

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize storage first
  await storagePromise;
  console.log('Storage initialized successfully');

  // Initialize services
  try {
    console.log('Initializing WhatsApp service...');
    await whatsappService.initialize();
    console.log('Initializing scheduler service...');
    await schedulerService.initialize();
  } catch (error) {
    console.error('Failed to initialize services:', error);
  }

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log('🔐 Tentativa de login:', req.body);

      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        console.log('❌ Dados inválidos:', result.error);
        return res.status(400).json({ error: "Dados inválidos", details: result.error });
      }

      const { username, password } = result.data;
      console.log('🔍 Validando usuário:', username);

      const user = await storage.validateUserPassword(username, password);

      if (!user) {
        console.log('❌ Credenciais inválidas para usuário:', username);
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      console.log('✅ Login bem-sucedido para usuário:', username);
      const token = generateToken(user.id);
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('💥 Erro no login:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    const { password: _, ...userWithoutPassword } = req.user!;
    res.json(userWithoutPassword);
  });

  app.post("/api/auth/logout", authenticateToken, async (_req, res) => {
    res.json({ message: "Logout realizado com sucesso" });
  });

  // User management routes (admin only)
  app.get("/api/users", authenticateToken, requireAdmin, async (_req, res) => {
    try {
      const users = await storage.getUsers();
      const usersWithoutPassword = users.map(({ password: _, ...user }) => user);
      res.json(usersWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Falha ao buscar usuários" });
    }
  });

  app.post("/api/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Dados inválidos", details: result.error });
      }

      const user = await storage.createUser(result.data);
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Falha ao criar usuário" });
    }
  });

  app.put("/api/users/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      console.log('📝 Atualizando usuário:', req.params.id, 'Dados:', req.body);

      const result = insertUserSchema.partial().safeParse(req.body);
      if (!result.success) {
        console.log('❌ Dados inválidos:', result.error);
        return res.status(400).json({ error: "Dados inválidos", details: result.error });
      }

      const user = await storage.updateUser(req.params.id, result.data);
      if (!user) {
        console.log('❌ Usuário não encontrado:', req.params.id);
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      console.log('✅ Usuário atualizado com sucesso:', user.username);
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('💥 Erro ao atualizar usuário:', error);
      res.status(500).json({ error: "Falha ao atualizar usuário" });
    }
  });

  // Employee routes
  app.get("/api/employees", authenticateToken, requireManagement, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const search = req.query.search as string || "";
      const position = req.query.position as string || "";
      const month = req.query.month as string || "";

      const result = await storage.getEmployeesPaginated(page, limit, search, position, month);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  app.post("/api/employees", authenticateToken, requireManagement, async (req, res) => {
    try {
      const result = insertEmployeeSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid employee data", details: result.error });
      }

      const employee = await storage.createEmployee(result.data);
      res.status(201).json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to create employee" });
    }
  });

  app.put("/api/employees/:id", authenticateToken, requireManagement, async (req, res) => {
    try {
      const result = insertEmployeeSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid employee data", details: result.error });
      }

      const employee = await storage.updateEmployee(req.params.id, result.data);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", authenticateToken, requireManagement, async (req, res) => {
    try {
      const success = await storage.deleteEmployee(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Employee not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete employee" });
    }
  });

  // Contact routes
  app.get("/api/contacts", authenticateToken, requireManagement, async (_req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  app.post("/api/contacts", authenticateToken, requireManagement, async (req, res) => {
    try {
      const result = insertContactSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid contact data", details: result.error });
      }

      const contact = await storage.createContact(result.data);
      res.status(201).json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to create contact" });
    }
  });

  app.put("/api/contacts/:id", authenticateToken, requireManagement, async (req, res) => {
    try {
      const result = insertContactSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid contact data", details: result.error });
      }

      const contact = await storage.updateContact(req.params.id, result.data);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }

      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to update contact" });
    }
  });

  app.delete("/api/contacts/:id", authenticateToken, requireManagement, async (req, res) => {
    try {
      const success = await storage.deleteContact(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Contact not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete contact" });
    }
  });

  // Messages routes
  app.get("/api/messages", authenticateToken, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      // Get all messages using storage method
      const allMessages = await storage.getMessages();

      // Filter by status if provided
      let filteredMessages = allMessages;
      if (status && status !== 'all') {
        filteredMessages = allMessages.filter(msg => msg.status === status);
      }

      // Sort by creation date (newest first)
      filteredMessages.sort((a, b) => {
        const dateA = a.sentAt || a.scheduledFor || new Date(0);
        const dateB = b.sentAt || b.scheduledFor || new Date(0);
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      const total = filteredMessages.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedMessages = filteredMessages.slice(offset, offset + limit);

      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      res.json({
        messages: paginatedMessages,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        }
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Settings routes
  app.get("/api/settings", authenticateToken, requireAdmin, async (_req, res) => {
    try {
      const settings = await storage.getSettings();
      if (!settings) {
        return res.status(404).json({ error: "Settings not found" });
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const result = insertSettingsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid settings data", details: result.error });
      }

      const settings = await storage.createOrUpdateSettings(result.data);

      // Update scheduler with new settings
      await schedulerService.updateSchedules();

      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  // WhatsApp connection routes
  app.get("/api/whatsapp/status", authenticateToken, requireAdmin, async (_req, res) => {
    try {
      const status = whatsappService.getConnectionStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to get WhatsApp status" });
    }
  });

  app.post("/api/whatsapp/connect", authenticateToken, requireAdmin, async (_req, res) => {
    try {
      await whatsappService.initialize();
      const status = whatsappService.getConnectionStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to initialize WhatsApp connection" });
    }
  });

  app.post("/api/whatsapp/refresh-qr", authenticateToken, requireAdmin, async (_req, res) => {
    try {
      const qrCode = await whatsappService.refreshQRCode();
      res.json({ qrCode });
    } catch (error) {
      res.status(500).json({ error: "Failed to refresh QR code" });
    }
  });

  app.post("/api/whatsapp/enable-simulation", authenticateToken, requireAdmin, async (_req, res) => {
    try {
      await whatsappService.enableSimulationMode();
      const status = whatsappService.getConnectionStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to enable simulation mode" });
    }
  });

  app.post("/api/whatsapp/enable-real", authenticateToken, requireAdmin, async (_req, res) => {
    try {
      await whatsappService.enableRealMode();
      const status = whatsappService.getConnectionStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to enable real mode" });
    }
  });

  app.post("/api/whatsapp/force-cleanup", authenticateToken, requireAdmin, async (_req, res) => {
    try {
      await whatsappService.forceCleanAuth();
      const status = whatsappService.getConnectionStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to enable real mode" });
    }
  });

  // New Baileys-specific routes
  app.get("/api/whatsapp/profile-picture/:phoneNumber", authenticateToken, async (req, res) => {
    try {
      const { phoneNumber } = req.params;
      const profilePicture = await whatsappService.getProfilePicture(phoneNumber);
      res.json({ profilePicture });
    } catch (error) {
      res.status(500).json({ error: "Failed to get profile picture" });
    }
  });

  app.get("/api/whatsapp/status/:phoneNumber", authenticateToken, async (req, res) => {
    try {
      const { phoneNumber } = req.params;
      const status = await whatsappService.getStatus(phoneNumber);
      res.json({ status });
    } catch (error) {
      res.status(500).json({ error: "Failed to get status" });
    }
  });

  app.post("/api/whatsapp/send-media", authenticateToken, async (req, res) => {
    try {
      const { phoneNumber, url, caption } = req.body;
      const success = await whatsappService.sendMediaFromUrl(phoneNumber, url, caption);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to send media" });
    }
  });

  app.post("/api/whatsapp/send-location", authenticateToken, async (req, res) => {
    try {
      const { phoneNumber, latitude, longitude, name } = req.body;
      const success = await whatsappService.sendLocation(phoneNumber, latitude, longitude, name);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to enable real mode" });
    }
  });

  app.post("/api/whatsapp/test-connection", authenticateToken, requireAdmin, async (_req, res) => {
    try {
      const connectionResult = await whatsappService.testConnection();
      res.json(connectionResult);
    } catch (error) {
      res.status(500).json({ error: "Failed to test WhatsApp connection" });
    }
  });

  app.post("/api/whatsapp/send-test", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { phoneNumber, message } = req.body;

      if (!phoneNumber || !message) {
        return res.status(400).json({ error: "Phone number and message are required" });
      }

      console.log(`🧪 Teste manual: Enviando mensagem para ${phoneNumber}`);
      console.log(`📝 Conteúdo: ${message}`);

      const success = await whatsappService.sendMessage(phoneNumber, message);

      if (success) {
        console.log(`✅ Teste manual: Mensagem enviada com sucesso para ${phoneNumber}`);
        res.json({ success: true, message: "Test message sent successfully" });
      } else {
        console.log(`❌ Teste manual: Falha no envio para ${phoneNumber}`);
        res.status(500).json({ error: "Failed to send test message" });
      }
    } catch (error) {
      console.log(`💥 Teste manual: Erro no envio para ${phoneNumber}:`, error);
      res.status(500).json({ error: "Failed to send test message" });
    }
  });

  app.post("/api/whatsapp/check-number", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { phoneNumber } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      // Simular a formatação que seria feita no sendMessage
      let formattedNumber = phoneNumber.replace(/\D/g, '');

      const originalFormatted = formattedNumber;

      // Aplicar formatação completa
      if (formattedNumber.length === 10) {
        // Número com 10 dígitos - adicionar 9º dígito
        const ddd = formattedNumber.substring(0, 2);
        const numero = formattedNumber.substring(2);
        formattedNumber = ddd + '9' + numero;
      }

      if (formattedNumber.length === 11 && !formattedNumber.startsWith('55')) {
        // Adicionar código do país
        formattedNumber = '55' + formattedNumber;
      }

      const chatId = formattedNumber + '@c.us';

      res.json({
        original: phoneNumber,
        cleaned: originalFormatted,
        formatted: formattedNumber,
        chatId: chatId,
        analysis: {
          hasCountryCode: formattedNumber.startsWith('55'),
          hasNinthDigit: formattedNumber.length === 13 && formattedNumber.substring(4, 5) === '9',
          isValid: formattedNumber.length === 13 && formattedNumber.startsWith('55')
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check number format" });
    }
  });

  // Debug endpoint to check contacts
  app.get("/api/debug/contacts", authenticateToken, requireAdmin, async (_req, res) => {
    try {
      const contacts = await storage.getContacts();
      const activeContacts = contacts.filter(c => c.isActive);

      console.log(`🔍 DEBUG - Total de contatos: ${contacts.length}`);
      console.log(`🔍 DEBUG - Contatos ativos: ${activeContacts.length}`);

      contacts.forEach(contact => {
        console.log(`📇 Contato: ${contact.name} | Telefone: ${contact.phone} | Ativo: ${contact.isActive} | Função: ${contact.role}`);
      });

      res.json({
        totalContacts: contacts.length,
        activeContacts: activeContacts.length,
        contacts: contacts.map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          role: c.role,
          isActive: c.isActive
        }))
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contacts for debug" });
    }
  });

  // Stats endpoint for dashboard
  app.get("/api/stats", authenticateToken, requireManagement, async (_req, res) => {
    try {
      const employees = await storage.getEmployees();
      const messages = await storage.getMessages();

      // Usar fuso horário brasileiro para todos os cálculos
      const now = new Date();
      const todayBrazil = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
      const thisMonth = todayBrazil.getMonth();

      const totalEmployees = employees.length;

      const thisMonthBirthdays = employees.filter(emp => {
        const birthDate = new Date(emp.birthDate + 'T00:00:00');
        return birthDate.getMonth() === thisMonth;
      }).length;

      const todayBirthdays = employees.filter(emp => {
        const birthDate = new Date(emp.birthDate + 'T00:00:00');
        return birthDate.getMonth() === todayBrazil.getMonth() &&
               birthDate.getDate() === todayBrazil.getDate();
      }).length;

      const messagesSent = messages.filter(msg => msg.status === 'sent').length;

      const upcomingBirthdays = employees
        .map(emp => {
          // Usar fuso horário brasileiro para data atual
          const now = new Date();
          const todayBrazil = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));

          const birthDate = new Date(emp.birthDate + 'T00:00:00');
          const thisYearBirthday = new Date(todayBrazil.getFullYear(), birthDate.getMonth(), birthDate.getDate());

          // Se o aniversário já passou este ano, calcular para o próximo ano
          const todayOnly = new Date(todayBrazil.getFullYear(), todayBrazil.getMonth(), todayBrazil.getDate());
          if (thisYearBirthday < todayOnly) {
            thisYearBirthday.setFullYear(todayBrazil.getFullYear() + 1);
          }

          const daysUntil = Math.ceil((thisYearBirthday.getTime() - todayOnly.getTime()) / (1000 * 60 * 60 * 24));

          return {
            employee: emp,
            daysUntil,
            date: thisYearBirthday
          };
        })
        .filter(item => item.daysUntil <= 7)
        .sort((a, b) => a.daysUntil - b.daysUntil);

      const recentMessages = messages
        .filter(msg => msg.sentAt)
        .sort((a, b) => new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime())
        .slice(0, 10);

      res.json({
        totalEmployees,
        thisMonthBirthdays,
        todayBirthdays,
        messagesSent,
        upcomingBirthdays,
        recentMessages
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}