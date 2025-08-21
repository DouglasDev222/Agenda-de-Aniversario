import dotenv from "dotenv";
dotenv.config();
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import * as crypto from 'crypto';
import { employees, contacts, messages, settings, users, } from "@shared/schema";
export class MemStorage {
    constructor() {
        this.employees = new Map();
        this.contacts = new Map();
        this.messages = new Map();
        this.users = new Map(); // Initialize users map
        this.initializeDefaults();
    }
    initializeDefaults() {
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
        const hashedPassword = bcrypt.hashSync("password", 10); // Hash the password
        const adminUser = {
            id: crypto.randomUUID(),
            email: 'admin@localhost',
            username: 'admin',
            password: hashedPassword,
            role: 'admin',
            isActive: true,
            createdAt: new Date(),
            lastLogin: null,
        };
        this.users.set(adminUser.id, adminUser);
    }
    // Employee operations
    async getEmployees() {
        return Array.from(this.employees.values());
    }
    async getEmployeesPaginated(page = 1, limit = 50, search = "", position = "", month = "") {
        let employees = Array.from(this.employees.values());
        // Apply filters
        if (search) {
            employees = employees.filter(emp => emp.name.toLowerCase().includes(search.toLowerCase()));
        }
        if (position && position !== "all") {
            employees = employees.filter(emp => emp.position.toLowerCase().includes(position.toLowerCase()));
        }
        if (month && month !== "all") {
            employees = employees.filter(emp => {
                const birthMonth = new Date(emp.birthDate + 'T00:00:00').getMonth() + 1;
                return birthMonth.toString() === month;
            });
        }
        // Sort by next birthday
        employees.sort((a, b) => {
            const getNextBirthday = (birthDate) => {
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
    async getEmployee(id) {
        return this.employees.get(id);
    }
    async createEmployee(insertEmployee) {
        const id = randomUUID();
        const employee = {
            ...insertEmployee,
            id,
            email: insertEmployee.email || null
        };
        this.employees.set(id, employee);
        return employee;
    }
    async updateEmployee(id, employee) {
        const existing = this.employees.get(id);
        if (!existing)
            return undefined;
        const updated = { ...existing, ...employee };
        this.employees.set(id, updated);
        return updated;
    }
    async deleteEmployee(id) {
        return this.employees.delete(id);
    }
    // Contact operations
    async getContacts() {
        return Array.from(this.contacts.values());
    }
    async getContact(id) {
        return this.contacts.get(id);
    }
    async createContact(insertContact) {
        const id = randomUUID();
        const contact = {
            ...insertContact,
            id,
            isActive: insertContact.isActive ?? true
        };
        this.contacts.set(id, contact);
        return contact;
    }
    async updateContact(id, contact) {
        const existing = this.contacts.get(id);
        if (!existing)
            return undefined;
        const updated = { ...existing, ...contact };
        this.contacts.set(id, updated);
        return updated;
    }
    async deleteContact(id) {
        return this.contacts.delete(id);
    }
    // Message operations
    async getMessages() {
        return Array.from(this.messages.values());
    }
    async getMessage(id) {
        return this.messages.get(id);
    }
    async createMessage(insertMessage) {
        const id = randomUUID();
        const message = {
            ...insertMessage,
            id,
            scheduledFor: insertMessage.scheduledFor || null,
            sentAt: insertMessage.sentAt || null,
            errorMessage: insertMessage.errorMessage || null
        };
        this.messages.set(id, message);
        return message;
    }
    async updateMessage(id, message) {
        const existing = this.messages.get(id);
        if (!existing)
            return undefined;
        const updated = { ...existing, ...message };
        this.messages.set(id, updated);
        return updated;
    }
    async deleteMessage(id) {
        return this.messages.delete(id);
    }
    // Settings operations
    async getSettings() {
        return this.settings;
    }
    async createOrUpdateSettings(insertSettings) {
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
    async createUser(userData) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
        const user = {
            id: crypto.randomUUID(),
            username: userData.username.toLowerCase().trim(),
            password: hashedPassword,
            isActive: true,
            createdAt: new Date(),
            lastLogin: null,
            email: userData.email,
            role: userData.role || 'user',
        };
        this.users.set(user.id, user);
        return user;
    }
    async getUserByUsername(username) {
        const lowerCaseUsername = username.toLowerCase().trim();
        for (const user of this.users.values()) {
            if (user.username === lowerCaseUsername && user.isActive) {
                return user;
            }
        }
        return null;
    }
    async getUserById(id) {
        const user = this.users.get(id);
        if (user && user.isActive) {
            return user;
        }
        return null;
    }
    async validateUserPassword(username, password) {
        const user = await this.getUserByUsername(username);
        if (!user)
            return null;
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid)
            return null;
        // Update last login for MemStorage (simple update)
        const updatedUser = { ...user, lastLogin: new Date() };
        this.users.set(user.id, updatedUser);
        return updatedUser;
    }
    async getUsers() {
        return Array.from(this.users.values()).filter(user => user.isActive);
    }
    async updateUser(id, data) {
        const existingUser = this.users.get(id);
        if (!existingUser || !existingUser.isActive)
            return null;
        const updateData = { ...data };
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        if (updateData.username) {
            updateData.username = updateData.username.toLowerCase().trim();
        }
        const updatedUser = {
            ...existingUser,
            ...updateData,
            lastLogin: existingUser.lastLogin // Keep the existing lastLogin if not updated
        };
        this.users.set(id, updatedUser);
        return updatedUser;
    }
    async deleteUser(id) {
        const user = this.users.get(id);
        if (!user)
            return false;
        // Mark as inactive instead of deleting from map for MemStorage
        const updatedUser = { ...user, isActive: false };
        this.users.set(id, updatedUser);
        return true;
    }
    async createDefaultUser() {
        // For MemStorage, the default admin user is already created in initializeDefaults
        console.log('✅ Usuário admin padrão já existe no MemStorage');
    }
}
// PostgreSQL Database Storage
export class DatabaseStorage {
    constructor() {
        const databaseUrl = process.env.DATABASE_URL;
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
    async getEmployees() {
        return await this.db.select().from(employees);
    }
    async getEmployeesPaginated(page = 1, limit = 50, search = "", position = "", month = "") {
        // For now, use simple in-memory pagination since we don't have complex SQL queries
        const allEmployees = await this.getEmployees();
        // Apply filters
        let filteredEmployees = allEmployees;
        if (search) {
            filteredEmployees = filteredEmployees.filter(emp => emp.name.toLowerCase().includes(search.toLowerCase()));
        }
        if (position && position !== "all") {
            filteredEmployees = filteredEmployees.filter(emp => emp.position.toLowerCase().includes(position.toLowerCase()));
        }
        if (month && month !== "all") {
            filteredEmployees = filteredEmployees.filter(emp => {
                const birthMonth = new Date(emp.birthDate + 'T00:00:00').getMonth() + 1;
                return birthMonth.toString() === month;
            });
        }
        // Sort by next birthday
        filteredEmployees.sort((a, b) => {
            const getNextBirthday = (birthDate) => {
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
    async getEmployee(id) {
        const result = await this.db.select().from(employees).where(eq(employees.id, id));
        return result[0];
    }
    async createEmployee(employee) {
        const id = randomUUID();
        const newEmployee = { ...employee, id };
        const result = await this.db.insert(employees).values(newEmployee).returning();
        return result[0];
    }
    async updateEmployee(id, employee) {
        const result = await this.db.update(employees).set(employee).where(eq(employees.id, id)).returning();
        return result[0];
    }
    async deleteEmployee(id) {
        const result = await this.db.delete(employees).where(eq(employees.id, id));
        return (result.rowCount ?? 0) > 0;
    }
    // Contact operations
    async getContacts() {
        return await this.db.select().from(contacts);
    }
    async getContact(id) {
        const result = await this.db.select().from(contacts).where(eq(contacts.id, id));
        return result[0];
    }
    async createContact(contact) {
        const id = randomUUID();
        const newContact = { ...contact, id,
            isActive: contact.isActive ?? true
        };
        const result = await this.db.insert(contacts).values(newContact).returning();
        return result[0];
    }
    async updateContact(id, contact) {
        const result = await this.db.update(contacts).set(contact).where(eq(contacts.id, id)).returning();
        return result[0];
    }
    async deleteContact(id) {
        const result = await this.db.delete(contacts).where(eq(contacts.id, id));
        return (result.rowCount ?? 0) > 0;
    }
    // Message operations
    async getMessages() {
        return await this.db.select().from(messages);
    }
    async getMessage(id) {
        const result = await this.db.select().from(messages).where(eq(messages.id, id));
        return result[0];
    }
    async createMessage(message) {
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
    async updateMessage(id, message) {
        const result = await this.db.update(messages).set(message).where(eq(messages.id, id)).returning();
        return result[0];
    }
    async deleteMessage(id) {
        const result = await this.db.delete(messages).where(eq(messages.id, id));
        return (result.rowCount ?? 0) > 0;
    }
    // Settings operations
    async getSettings() {
        const result = await this.db.select().from(settings).limit(1);
        return result[0];
    }
    async createOrUpdateSettings(insertSettings) {
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
        }
        else {
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
    async createUser(userData) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
        const [user] = await this.db.insert(users).values({
            ...userData,
            username: userData.username.toLowerCase().trim(),
            password: hashedPassword,
            role: userData.role || 'user' // Ensure role is set, default to 'user'
        }).returning();
        return user;
    }
    async getUserByUsername(username) {
        const [user] = await this.db
            .select()
            .from(users)
            .where(and(eq(users.username, username.toLowerCase().trim()), eq(users.isActive, true)))
            .limit(1);
        return user || null;
    }
    async getUserById(id) {
        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);
        return user || null;
    }
    async validateUserPassword(username, password) {
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
    async getUsers() {
        return await this.db
            .select()
            .from(users)
            .where(eq(users.isActive, true))
            .orderBy(users.username);
    }
    async updateUser(id, data) {
        const updateData = { ...data };
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        if (updateData.username) {
            updateData.username = updateData.username.toLowerCase().trim();
        }
        if (updateData.role) { // Ensure role is updated if provided
            updateData.role = updateData.role;
        }
        const [user] = await this.db
            .update(users)
            .set(updateData)
            .where(eq(users.id, id))
            .returning();
        return user || null;
    }
    async deleteUser(id) {
        const result = await this.db
            .update(users)
            .set({ isActive: false })
            .where(eq(users.id, id));
        return (result.rowCount ?? 0) > 0;
    }
    async createDefaultUser() {
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
        }
        catch (error) {
            console.error('❌ Erro ao criar usuário admin padrão:', error);
            throw error;
        }
    }
}
// Initialize storage with Supabase, with retry mechanism
async function initializeStorage() {
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
    }
    else {
        console.log('URL parsing issue - no @ found in expected position');
    }
    const dbStorage = new DatabaseStorage();
    // Retry mechanism
    const maxRetries = 3;
    let lastError;
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
        }
        catch (error) {
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
let storage;
const storagePromise = initializeStorage().then((s) => {
    storage = s;
    return s;
});
export { storage, storagePromise };
