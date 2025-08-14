import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, storagePromise } from "./storage";
import { whatsappService } from "./services/whatsapp";
import { schedulerService } from "./services/scheduler";
import { insertEmployeeSchema, insertContactSchema, insertSettingsSchema } from "@shared/schema";

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

  // Employee routes
  app.get("/api/employees", async (_req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  app.post("/api/employees", async (req, res) => {
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

  app.put("/api/employees/:id", async (req, res) => {
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

  app.delete("/api/employees/:id", async (req, res) => {
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
  app.get("/api/contacts", async (_req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
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

  app.put("/api/contacts/:id", async (req, res) => {
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

  app.delete("/api/contacts/:id", async (req, res) => {
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

  // Message routes
  app.get("/api/messages", async (_req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (_req, res) => {
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

  app.post("/api/settings", async (req, res) => {
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
  app.get("/api/whatsapp/status", async (_req, res) => {
    try {
      const status = whatsappService.getConnectionStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to get WhatsApp status" });
    }
  });

  app.post("/api/whatsapp/connect", async (_req, res) => {
    try {
      await whatsappService.initialize();
      const status = whatsappService.getConnectionStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to initialize WhatsApp connection" });
    }
  });

  app.post("/api/whatsapp/refresh-qr", async (_req, res) => {
    try {
      const qrCode = await whatsappService.refreshQRCode();
      res.json({ qrCode });
    } catch (error) {
      res.status(500).json({ error: "Failed to refresh QR code" });
    }
  });

  app.post("/api/whatsapp/enable-simulation", async (_req, res) => {
    try {
      await whatsappService.enableSimulationMode();
      const status = whatsappService.getConnectionStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to enable simulation mode" });
    }
  });

  app.post("/api/whatsapp/enable-real", async (_req, res) => {
    try {
      await whatsappService.enableRealMode();
      const status = whatsappService.getConnectionStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to enable real mode" });
    }
  });

  app.post("/api/whatsapp/test-connection", async (_req, res) => {
    try {
      const connectionResult = await whatsappService.testConnection();
      res.json(connectionResult);
    } catch (error) {
      res.status(500).json({ error: "Failed to test WhatsApp connection" });
    }
  });

  app.post("/api/whatsapp/send-test", async (req, res) => {
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

  app.post("/api/whatsapp/check-number", async (req, res) => {
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
  app.get("/api/debug/contacts", async (_req, res) => {
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
  app.get("/api/stats", async (_req, res) => {
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
