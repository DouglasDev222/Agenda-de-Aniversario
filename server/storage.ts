import dotenv from "dotenv";
dotenv.config();

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import * as crypto from 'crypto';

import {
  employees,
  contacts,
  messages,
  settings,
  users,
  type Employee,
  type Contact,
  type Message,
  type Settings,
  type User,
  type InsertEmployee,
  type InsertContact,
  type InsertMessage,
  type InsertSettings,
  type InsertUser,
} from "@shared/schema";

export interface IStorage {
  // Employee operations
  getEmployees(): Promise<Employee[]>;
  getEmployeesPaginated(page?: number, limit?: number, search?: string, position?: string, month?: string): Promise<{
    employees: Employee[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>;
  getEmployee(id: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: string): Promise<boolean>;

  // Contact operations
  getContacts(): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: string, contact: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: string): Promise<boolean>;

  // Message operations
  getMessages(): Promise<Message[]>;
  getMessage(id: string): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: string, message: Partial<InsertMessage>): Promise<Message | undefined>;
  deleteMessage(id: string): Promise<boolean>;

  // Settings operations
  getSettings(): Promise<Settings | undefined>;
  createOrUpdateSettings(settings: InsertSettings): Promise<Settings>;

  // User operations
  createUser(data: InsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  validateUserPassword(username: string, password: string): Promise<User | null>;
  getUsers(): Promise<User[]>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | null>;
  deleteUser(id: string): Promise<boolean>;
  createDefaultUser(): Promise<void>;
}

export class MemStorage implements IStorage {
  private employees: Map<string, Employee>;
  private contacts: Map<string, Contact>;
  private messages: Map<string, Message>;
  private settings: Settings | undefined;
  private users: Map<string, User>; // Added for MemStorage

  constructor() {
    this.employees = new Map();
    this.contacts = new Map();
    this.messages = new Map();
    this.users = new Map(); // Initialize users map
    this.initializeDefaults();
  }

  private initializeDefaults() {
    // Initialize default settings
    this.settings = {
      id: randomUUID(),
      reminderTemplate: "🎉 Lembrete: Amanhã é aniversário de [NOME]!\nCargo: [CARGO]\nNão esqueça de parabenizar! 🎂",
      birthdayTemplate: "🎂 Hoje é aniversário de [NOME]!\nCargo: [CARGO]\nParabenize nossa equipe! 🎉🎈",
      reminderTime: "08:00",
      birthdayTime: "09:00",
      weekendsEnabled: true,
      retryAttempts: 2,
      retryInterval: 5,
    };

    // Initialize a default admin user for MemStorage
    const adminUser: User = {
      id: randomUUID(),
      username: "admin",
      password: "password", // In a real app, this should be hashed
      role: "admin",
      isActive: true,
      lastLogin: null
    };
    this.users.set(adminUser.id, adminUser);
  }

  // Employee operations
  async getEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async getEmployeesPaginated(page: number = 1, limit: number = 50, search: string = "", position: string = "", month: string = ""): Promise<{
    employees: Employee[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    let employees = Array.from(this.employees.values());

    // Apply filters
    if (search) {
      employees = employees.filter(emp =>
        emp.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (position && position !== "all") {
      employees = employees.filter(emp =>
        emp.position.toLowerCase().includes(position.toLowerCase())
      );
    }

    if (month && month !== "all") {
      employees = employees.filter(emp => {
        const birthMonth = new Date(emp.birthDate + 'T00:00:00').getMonth() + 1;
        return birthMonth.toString() === month;
      });
    }

    // Sort by next birthday
    employees.sort((a, b) => {
      const getNextBirthday = (birthDate: string) => {
        const birth = new Date(birthDate + 'T00:00:00');
        const today = new Date();
        const thisYear = today.getFullYear();
        let nextBirthday = new Date(thisYear, birth.getMonth(), birth.getDate());
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (nextBirthday < todayDateOnly) {
          nextBirthday = new Date(thisYear + 1, birth.getMonth(), birth.getDate());
        }
        const diffTime = nextBirthday.getTime() - todayDateOnly.getTime();
        return Math.round(diffTime / (1000 * 60 * 60 * 24));
      };

      const daysA = getNextBirthday(a.birthDate);
      const daysB = getNextBirthday(b.birthDate);

      if (daysA === daysB) {
        return a.name.localeCompare(b.name);
      }
      return daysA - daysB;
    });

    const total = employees.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedEmployees = employees.slice(offset, offset + limit);

    return {
      employees: paginatedEmployees,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const employee: Employee = {
      ...insertEmployee,
      id,
      email: insertEmployee.email || null
    };
    this.employees.set(id, employee);
    return employee;
  }

  async updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const existing = this.employees.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...employee };
    this.employees.set(id, updated);
    return updated;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    return this.employees.delete(id);
  }

  // Contact operations
  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async getContact(id: string): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = {
      ...insertContact,
      id,
      isActive: insertContact.isActive ?? true
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async updateContact(id: string, contact: Partial<InsertContact>): Promise<Contact | undefined> {
    const existing = this.contacts.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...contact };
    this.contacts.set(id, updated);
    return updated;
  }

  async deleteContact(id: string): Promise<boolean> {
    return this.contacts.delete(id);
  }

  // Message operations
  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values());
  }

  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      scheduledFor: insertMessage.scheduledFor || null,
      sentAt: insertMessage.sentAt || null,
      errorMessage: insertMessage.errorMessage || null
    };
    this.messages.set(id, message);
    return message;
  }

  async updateMessage(id: string, message: Partial<InsertMessage>): Promise<Message | undefined> {
    const existing = this.messages.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...message };
    this.messages.set(id, updated);
    return updated;
  }

  async deleteMessage(id: string): Promise<boolean> {
    return this.messages.delete(id);
  }

  // Settings operations
  async getSettings(): Promise<Settings | undefined> {
    return this.settings;
  }

  async createOrUpdateSettings(insertSettings: InsertSettings): Promise<Settings> {
    const id = this.settings?.id || randomUUID();
    this.settings = {
      ...insertSettings,
      id,
      reminderTime: insertSettings.reminderTime || "08:00",
      birthdayTime: insertSettings.birthdayTime || "09:00",
      weekendsEnabled: insertSettings.weekendsEnabled ?? true,
      retryAttempts: insertSettings.retryAttempts || 2,
      retryInterval: insertSettings.retryInterval || 5
    };
    return this.settings;
  }

  // User methods (for MemStorage)
  async createUser(userData: InsertUser): Promise<User> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    const user: User = {
      id: crypto.randomUUID(),
      ...userData,
      username: userData.username.toLowerCase().trim(),
      password: hashedPassword,
      isActive: true,
      createdAt: new Date(),
      lastLogin: null
    };
    this.users.set(user.id, user);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const lowerCaseUsername = username.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.username === lowerCaseUsername && user.isActive) {
        return user;
      }
    }
    return null;
  }

  async getUserById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    if (user && user.isActive) {
      return user;
    }
    return null;
  }

  async validateUserPassword(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    // Update last login for MemStorage (simple update)
    const updatedUser = { ...user, lastLogin: new Date() };
    this.users.set(user.id, updatedUser);

    return updatedUser;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.isActive);
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | null> {
    const existingUser = this.users.get(id);
    if (!existingUser || !existingUser.isActive) return null;

    let hashedPassword = existingUser.password;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = {
      ...existingUser,
      ...data,
      username: data.username ? data.username.toLowerCase().trim() : existingUser.username,
      password: hashedPassword,
      lastLogin: existingUser.lastLogin // Keep the existing lastLogin if not updated
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;
    // Mark as inactive instead of deleting from map for MemStorage
    const updatedUser = { ...user, isActive: false };
    this.users.set(id, updatedUser);
    return true;
  }

  async createDefaultUser(): Promise<void> {
    // For MemStorage, the default admin user is already created in initializeDefaults
    console.log('✅ Usuário admin padrão já existe no MemStorage');
  }
}

// PostgreSQL Database Storage
export class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL!;

    // Create a connection pool using pg library for better Supabase compatibility
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.db = drizzle(pool);
    console.log('Database connection pool created for Supabase');
  }

  // Employee operations
  async getEmployees(): Promise<Employee[]> {
    return await this.db.select().from(employees);
  }

  async getEmployeesPaginated(page: number = 1, limit: number = 50, search: string = "", position: string = "", month: string = ""): Promise<{
    employees: Employee[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    // For now, use simple in-memory pagination since we don't have complex SQL queries
    const allEmployees = await this.getEmployees();

    // Apply filters
    let filteredEmployees = allEmployees;

    if (search) {
      filteredEmployees = filteredEmployees.filter(emp =>
        emp.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (position && position !== "all") {
      filteredEmployees = filteredEmployees.filter(emp =>
        emp.position.toLowerCase().includes(position.toLowerCase())
      );
    }

    if (month && month !== "all") {
      filteredEmployees = filteredEmployees.filter(emp => {
        const birthMonth = new Date(emp.birthDate + 'T00:00:00').getMonth() + 1;
        return birthMonth.toString() === month;
      });
    }

    // Sort by next birthday
    filteredEmployees.sort((a, b) => {
      const getNextBirthday = (birthDate: string) => {
        const birth = new Date(birthDate + 'T00:00:00');
        const today = new Date();
        const thisYear = today.getFullYear();
        let nextBirthday = new Date(thisYear, birth.getMonth(), birth.getDate());
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (nextBirthday < todayDateOnly) {
          nextBirthday = new Date(thisYear + 1, birth.getMonth(), birth.getDate());
        }
        const diffTime = nextBirthday.getTime() - todayDateOnly.getTime();
        return Math.round(diffTime / (1000 * 60 * 60 * 24));
      };

      const daysA = getNextBirthday(a.birthDate);
      const daysB = getNextBirthday(b.birthDate);

      if (daysA === daysB) {
        return a.name.localeCompare(b.name);
      }
      return daysA - daysB;
    });

    const total = filteredEmployees.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedEmployees = filteredEmployees.slice(offset, offset + limit);

    return {
      employees: paginatedEmployees,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    const result = await this.db.select().from(employees).where(eq(employees.id, id));
    return result[0];
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const newEmployee = { ...employee, id };
    const result = await this.db.insert(employees).values(newEmployee).returning();
    return result[0];
  }

  async updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const result = await this.db.update(employees).set(employee).where(eq(employees.id, id)).returning();
    return result[0];
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const result = await this.db.delete(employees).where(eq(employees.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Contact operations
  async getContacts(): Promise<Contact[]> {
    return await this.db.select().from(contacts);
  }

  async getContact(id: string): Promise<Contact | undefined> {
    const result = await this.db.select().from(contacts).where(eq(contacts.id, id));
    return result[0];
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const newContact = { ...contact, id,
      isActive: contact.isActive ?? true
    };
    const result = await this.db.insert(contacts).values(newContact).returning();
    return result[0];
  }

  async updateContact(id: string, contact: Partial<InsertContact>): Promise<Contact | undefined> {
    const result = await this.db.update(contacts).set(contact).where(eq(contacts.id, id)).returning();
    return result[0];
  }

  async deleteContact(id: string): Promise<boolean> {
    const result = await this.db.delete(contacts).where(eq(contacts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Message operations
  async getMessages(): Promise<Message[]> {
    return await this.db.select().from(messages);
  }

  async getMessage(id: string): Promise<Message | undefined> {
    const result = await this.db.select().from(messages).where(eq(messages.id, id));
    return result[0];
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const newMessage = {
      ...message,
      id,
      scheduledFor: message.scheduledFor || null,
      sentAt: message.sentAt || null,
      errorMessage: message.errorMessage || null
    };
    const result = await this.db.insert(messages).values(newMessage).returning();
    return result[0];
  }

  async updateMessage(id: string, message: Partial<InsertMessage>): Promise<Message | undefined> {
    const result = await this.db.update(messages).set(message).where(eq(messages.id, id)).returning();
    return result[0];
  }

  async deleteMessage(id: string): Promise<boolean> {
    const result = await this.db.delete(messages).where(eq(messages.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Settings operations
  async getSettings(): Promise<Settings | undefined> {
    const result = await this.db.select().from(settings).limit(1);
    return result[0];
  }

  async createOrUpdateSettings(insertSettings: InsertSettings): Promise<Settings> {
    const existing = await this.getSettings();

    if (existing) {
      const result = await this.db.update(settings)
        .set({
          ...insertSettings,
          reminderTime: insertSettings.reminderTime || "08:00",
          birthdayTime: insertSettings.birthdayTime || "09:00",
          weekendsEnabled: insertSettings.weekendsEnabled ?? true,
          retryAttempts: insertSettings.retryAttempts || 2,
          retryInterval: insertSettings.retryInterval || 5
        })
        .where(eq(settings.id, existing.id))
        .returning();
      return result[0];
    } else {
      const id = randomUUID();
      const newSettings = {
        ...insertSettings,
        id,
        reminderTime: insertSettings.reminderTime || "08:00",
        birthdayTime: insertSettings.birthdayTime || "09:00",
        weekendsEnabled: insertSettings.weekendsEnabled ?? true,
        retryAttempts: insertSettings.retryAttempts || 2,
        retryInterval: insertSettings.retryInterval || 5
      };
      const result = await this.db.insert(settings).values(newSettings).returning();
      return result[0];
    }
  }

  // User methods
  async createUser(userData: InsertUser): Promise<User> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    const [user] = await this.db.insert(users).values({
      ...userData,
      username: userData.username.toLowerCase().trim(),
      password: hashedPassword
    }).returning();

    return user;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.username, username.toLowerCase().trim()), eq(users.isActive, true)))
      .limit(1);
    return user || null;
  }

  async getUserById(id: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user || null;
  }

  async validateUserPassword(username: string, password: string): Promise<User | null> {
    const [user] = await this.db.select()
      .from(users)
      .where(eq(users.username, username.toLowerCase().trim()))
      .limit(1);

    if (!user) {
      console.log('🔍 Usuário não encontrado:', username);
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    console.log('🔐 Senha válida:', isValid);

    if (!isValid) {
      return null;
    }

    // Update last login
    await this.db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));

    return user;
  }

  async getUsers(): Promise<User[]> {
    return await this.db
      .select()
      .from(users)
      .where(eq(users.isActive, true))
      .orderBy(users.username);
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | null> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    if (data.username) {
      data.username = data.username.toLowerCase().trim();
    }

    const [user] = await this.db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.db
      .update(users)
      .set({ isActive: false })
      .where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async createDefaultUser(): Promise<void> {
    try {
      // Check if admin user already exists
      const existingAdmin = await this.getUserByUsername('admin');
      if (existingAdmin) {
        console.log('✅ Usuário admin já existe');
        return;
      }

      console.log('🔧 Criando usuário admin padrão...');

      // Create default admin user
      const adminUser = await this.createUser({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });

      console.log('✅ Usuário admin criado com sucesso:', adminUser.username);
    } catch (error) {
      console.error('❌ Erro ao criar usuário admin padrão:', error);
      throw error;
    }
  }
}

// Initialize storage with Supabase, with retry mechanism
async function initializeStorage(): Promise<IStorage> {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não encontrada nas variáveis de ambiente');
    console.error('Por favor, configure a DATABASE_URL do Supabase');
    throw new Error('DATABASE_URL environment variable is required for Supabase connection');
  }

  console.log('🔗 Conectando ao Supabase...');
  console.log('Database URL exists:', !!process.env.DATABASE_URL);
  console.log('Database URL format check:', process.env.DATABASE_URL?.startsWith('postgresql://') ? 'Valid PostgreSQL URL' : 'Invalid URL format');

  // Show partial URL for debugging (hide sensitive parts)
  const urlParts = process.env.DATABASE_URL.split('@');
  if (urlParts.length > 1) {
    const hostPart = urlParts[urlParts.length - 1].split('/')[0];
    console.log('Connecting to host:', hostPart);
  } else {
    console.log('URL parsing issue - no @ found in expected position');
  }

  const dbStorage = new DatabaseStorage();

  // Retry mechanism
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Tentativa ${attempt}/${maxRetries} de conexão...`);

      // Test the connection with a timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 10000);
      });

      // Use a method that interacts with the database to test the connection
      // getSettings is a good candidate as it's likely to be simple and fast.
      const connectionTestPromise = dbStorage.getSettings();
      await Promise.race([connectionTestPromise, timeoutPromise]);

      console.log('✅ Conectado ao Supabase com sucesso!');

      // Create default admin user after successful connection
      await dbStorage.createDefaultUser();

      return dbStorage; // Connection successful, exit the loop
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Tentativa ${attempt} falhou:`, error.message);

      if (attempt < maxRetries) {
        console.log(`Aguardando 2s antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  // If all retries failed, provide detailed error information
  console.error('❌ Todas as tentativas de conexão falharam');
  console.error('Último erro:', lastError.message);

  if (lastError.message.includes('fetch failed') || lastError.message.includes('ENOTFOUND')) {
    console.error('');
    console.error('🔍 Possíveis causas:');
    console.error('1. URL do Supabase incorreta ou mal formatada');
    console.error('2. Projeto Supabase pausado ou inacessível');
    console.error('3. Senha incorreta na URL de conexão');
    console.error('4. Problemas de conectividade de rede');
    console.error('');
    console.error('📋 Verifique:');
    console.error('- Se substituiu [YOUR-PASSWORD] pela senha real');
    console.error('- Se o projeto está ativo no dashboard do Supabase');
    console.error('- Se copiou a URL correta (Transaction pooler)');
  }

  throw new Error(`Falha na conexão com Supabase após ${maxRetries} tentativas: ${lastError.message}`);
}

// Initialize storage asynchronously
let storage: IStorage;
const storagePromise = initializeStorage().then((s) => {
  storage = s;
  return s;
});

export { storage, storagePromise };