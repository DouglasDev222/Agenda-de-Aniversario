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
      const isConnected = await whatsappService.testConnection();
      res.json({ connected: isConnected });
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
      
      const success = await whatsappService.sendMessage(phoneNumber, message);
      
      if (success) {
        res.json({ success: true, message: "Test message sent successfully" });
      } else {
        res.status(500).json({ error: "Failed to send test message" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to send test message" });
    }
  });

  // Stats endpoint for dashboard
  app.get("/api/stats", async (_req, res) => {
    try {
      const employees = await storage.getEmployees();
      const messages = await storage.getMessages();
      
      const today = new Date();
      const thisMonth = today.getMonth();
      
      const totalEmployees = employees.length;
      
      const thisMonthBirthdays = employees.filter(emp => {
        const birthDate = new Date(emp.birthDate);
        return birthDate.getMonth() === thisMonth;
      }).length;
      
      const todayBirthdays = employees.filter(emp => {
        const birthDate = new Date(emp.birthDate);
        return birthDate.getMonth() === today.getMonth() && 
               birthDate.getDate() === today.getDate();
      }).length;
      
      const messagesSent = messages.filter(msg => msg.status === 'sent').length;
      
      const upcomingBirthdays = employees
        .map(emp => {
          const birthDate = new Date(emp.birthDate);
          const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
          
          if (thisYearBirthday < today) {
            thisYearBirthday.setFullYear(today.getFullYear() + 1);
          }
          
          const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
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
