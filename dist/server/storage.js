var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import dotenv from "dotenv";
dotenv.config();
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import * as crypto from 'crypto';
import { employees, contacts, messages, settings, users, } from "@shared/schema";
var MemStorage = /** @class */ (function () {
    function MemStorage() {
        this.employees = new Map();
        this.contacts = new Map();
        this.messages = new Map();
        this.users = new Map(); // Initialize users map
        this.initializeDefaults();
    }
    MemStorage.prototype.initializeDefaults = function () {
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
        var adminUser = {
            id: randomUUID(),
            username: "admin",
            password: "password", // In a real app, this should be hashed
            role: "admin",
            isActive: true,
            lastLogin: null
        };
        this.users.set(adminUser.id, adminUser);
    };
    // Employee operations
    MemStorage.prototype.getEmployees = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.employees.values())];
            });
        });
    };
    MemStorage.prototype.getEmployeesPaginated = function () {
        return __awaiter(this, arguments, void 0, function (page, limit, search, position, month) {
            var employees, total, totalPages, offset, paginatedEmployees;
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 50; }
            if (search === void 0) { search = ""; }
            if (position === void 0) { position = ""; }
            if (month === void 0) { month = ""; }
            return __generator(this, function (_a) {
                employees = Array.from(this.employees.values());
                // Apply filters
                if (search) {
                    employees = employees.filter(function (emp) {
                        return emp.name.toLowerCase().includes(search.toLowerCase());
                    });
                }
                if (position && position !== "all") {
                    employees = employees.filter(function (emp) {
                        return emp.position.toLowerCase().includes(position.toLowerCase());
                    });
                }
                if (month && month !== "all") {
                    employees = employees.filter(function (emp) {
                        var birthMonth = new Date(emp.birthDate + 'T00:00:00').getMonth() + 1;
                        return birthMonth.toString() === month;
                    });
                }
                // Sort by next birthday
                employees.sort(function (a, b) {
                    var getNextBirthday = function (birthDate) {
                        var birth = new Date(birthDate + 'T00:00:00');
                        var today = new Date();
                        var thisYear = today.getFullYear();
                        var nextBirthday = new Date(thisYear, birth.getMonth(), birth.getDate());
                        var todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        if (nextBirthday < todayDateOnly) {
                            nextBirthday = new Date(thisYear + 1, birth.getMonth(), birth.getDate());
                        }
                        var diffTime = nextBirthday.getTime() - todayDateOnly.getTime();
                        return Math.round(diffTime / (1000 * 60 * 60 * 24));
                    };
                    var daysA = getNextBirthday(a.birthDate);
                    var daysB = getNextBirthday(b.birthDate);
                    if (daysA === daysB) {
                        return a.name.localeCompare(b.name);
                    }
                    return daysA - daysB;
                });
                total = employees.length;
                totalPages = Math.ceil(total / limit);
                offset = (page - 1) * limit;
                paginatedEmployees = employees.slice(offset, offset + limit);
                return [2 /*return*/, {
                        employees: paginatedEmployees,
                        pagination: {
                            page: page,
                            limit: limit,
                            total: total,
                            totalPages: totalPages,
                            hasNext: page < totalPages,
                            hasPrev: page > 1
                        }
                    }];
            });
        });
    };
    MemStorage.prototype.getEmployee = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.employees.get(id)];
            });
        });
    };
    MemStorage.prototype.createEmployee = function (insertEmployee) {
        return __awaiter(this, void 0, void 0, function () {
            var id, employee;
            return __generator(this, function (_a) {
                id = randomUUID();
                employee = __assign(__assign({}, insertEmployee), { id: id, email: insertEmployee.email || null });
                this.employees.set(id, employee);
                return [2 /*return*/, employee];
            });
        });
    };
    MemStorage.prototype.updateEmployee = function (id, employee) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, updated;
            return __generator(this, function (_a) {
                existing = this.employees.get(id);
                if (!existing)
                    return [2 /*return*/, undefined];
                updated = __assign(__assign({}, existing), employee);
                this.employees.set(id, updated);
                return [2 /*return*/, updated];
            });
        });
    };
    MemStorage.prototype.deleteEmployee = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.employees.delete(id)];
            });
        });
    };
    // Contact operations
    MemStorage.prototype.getContacts = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.contacts.values())];
            });
        });
    };
    MemStorage.prototype.getContact = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.contacts.get(id)];
            });
        });
    };
    MemStorage.prototype.createContact = function (insertContact) {
        return __awaiter(this, void 0, void 0, function () {
            var id, contact;
            var _a;
            return __generator(this, function (_b) {
                id = randomUUID();
                contact = __assign(__assign({}, insertContact), { id: id, isActive: (_a = insertContact.isActive) !== null && _a !== void 0 ? _a : true });
                this.contacts.set(id, contact);
                return [2 /*return*/, contact];
            });
        });
    };
    MemStorage.prototype.updateContact = function (id, contact) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, updated;
            return __generator(this, function (_a) {
                existing = this.contacts.get(id);
                if (!existing)
                    return [2 /*return*/, undefined];
                updated = __assign(__assign({}, existing), contact);
                this.contacts.set(id, updated);
                return [2 /*return*/, updated];
            });
        });
    };
    MemStorage.prototype.deleteContact = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.contacts.delete(id)];
            });
        });
    };
    // Message operations
    MemStorage.prototype.getMessages = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.messages.values())];
            });
        });
    };
    MemStorage.prototype.getMessage = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.messages.get(id)];
            });
        });
    };
    MemStorage.prototype.createMessage = function (insertMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var id, message;
            return __generator(this, function (_a) {
                id = randomUUID();
                message = __assign(__assign({}, insertMessage), { id: id, scheduledFor: insertMessage.scheduledFor || null, sentAt: insertMessage.sentAt || null, errorMessage: insertMessage.errorMessage || null });
                this.messages.set(id, message);
                return [2 /*return*/, message];
            });
        });
    };
    MemStorage.prototype.updateMessage = function (id, message) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, updated;
            return __generator(this, function (_a) {
                existing = this.messages.get(id);
                if (!existing)
                    return [2 /*return*/, undefined];
                updated = __assign(__assign({}, existing), message);
                this.messages.set(id, updated);
                return [2 /*return*/, updated];
            });
        });
    };
    MemStorage.prototype.deleteMessage = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.messages.delete(id)];
            });
        });
    };
    // Settings operations
    MemStorage.prototype.getSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.settings];
            });
        });
    };
    MemStorage.prototype.createOrUpdateSettings = function (insertSettings) {
        return __awaiter(this, void 0, void 0, function () {
            var id;
            var _a, _b;
            return __generator(this, function (_c) {
                id = ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.id) || randomUUID();
                this.settings = __assign(__assign({}, insertSettings), { id: id, reminderTime: insertSettings.reminderTime || "08:00", birthdayTime: insertSettings.birthdayTime || "09:00", weekendsEnabled: (_b = insertSettings.weekendsEnabled) !== null && _b !== void 0 ? _b : true, retryAttempts: insertSettings.retryAttempts || 2, retryInterval: insertSettings.retryInterval || 5 });
                return [2 /*return*/, this.settings];
            });
        });
    };
    // User methods (for MemStorage)
    MemStorage.prototype.createUser = function (userData) {
        return __awaiter(this, void 0, void 0, function () {
            var saltRounds, hashedPassword, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        saltRounds = 10;
                        return [4 /*yield*/, bcrypt.hash(userData.password, saltRounds)];
                    case 1:
                        hashedPassword = _a.sent();
                        user = __assign(__assign({ id: crypto.randomUUID() }, userData), { username: userData.username.toLowerCase().trim(), password: hashedPassword, isActive: true, createdAt: new Date(), lastLogin: null });
                        this.users.set(user.id, user);
                        return [2 /*return*/, user];
                }
            });
        });
    };
    MemStorage.prototype.getUserByUsername = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            var lowerCaseUsername, _i, _a, user;
            return __generator(this, function (_b) {
                lowerCaseUsername = username.toLowerCase().trim();
                for (_i = 0, _a = this.users.values(); _i < _a.length; _i++) {
                    user = _a[_i];
                    if (user.username === lowerCaseUsername && user.isActive) {
                        return [2 /*return*/, user];
                    }
                }
                return [2 /*return*/, null];
            });
        });
    };
    MemStorage.prototype.getUserById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                user = this.users.get(id);
                if (user && user.isActive) {
                    return [2 /*return*/, user];
                }
                return [2 /*return*/, null];
            });
        });
    };
    MemStorage.prototype.validateUserPassword = function (username, password) {
        return __awaiter(this, void 0, void 0, function () {
            var user, isValid, updatedUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUserByUsername(username)];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, bcrypt.compare(password, user.password)];
                    case 2:
                        isValid = _a.sent();
                        if (!isValid)
                            return [2 /*return*/, null];
                        updatedUser = __assign(__assign({}, user), { lastLogin: new Date() });
                        this.users.set(user.id, updatedUser);
                        return [2 /*return*/, updatedUser];
                }
            });
        });
    };
    MemStorage.prototype.getUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.users.values()).filter(function (user) { return user.isActive; })];
            });
        });
    };
    MemStorage.prototype.updateUser = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var existingUser, updateData, _a, updatedUser;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        existingUser = this.users.get(id);
                        if (!existingUser || !existingUser.isActive)
                            return [2 /*return*/, null];
                        updateData = __assign({}, data);
                        if (!updateData.password) return [3 /*break*/, 2];
                        _a = updateData;
                        return [4 /*yield*/, bcrypt.hash(updateData.password, 10)];
                    case 1:
                        _a.password = _b.sent();
                        _b.label = 2;
                    case 2:
                        if (updateData.username) {
                            updateData.username = updateData.username.toLowerCase().trim();
                        }
                        updatedUser = __assign(__assign(__assign({}, existingUser), updateData), { lastLogin: existingUser.lastLogin // Keep the existing lastLogin if not updated
                         });
                        this.users.set(id, updatedUser);
                        return [2 /*return*/, updatedUser];
                }
            });
        });
    };
    MemStorage.prototype.deleteUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var user, updatedUser;
            return __generator(this, function (_a) {
                user = this.users.get(id);
                if (!user)
                    return [2 /*return*/, false];
                updatedUser = __assign(__assign({}, user), { isActive: false });
                this.users.set(id, updatedUser);
                return [2 /*return*/, true];
            });
        });
    };
    MemStorage.prototype.createDefaultUser = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // For MemStorage, the default admin user is already created in initializeDefaults
                console.log('✅ Usuário admin padrão já existe no MemStorage');
                return [2 /*return*/];
            });
        });
    };
    return MemStorage;
}());
export { MemStorage };
// PostgreSQL Database Storage
var DatabaseStorage = /** @class */ (function () {
    function DatabaseStorage() {
        var databaseUrl = process.env.DATABASE_URL;
        // Create a connection pool using pg library for better Supabase compatibility
        var pool = new Pool({
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
    DatabaseStorage.prototype.getEmployees = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.select().from(employees)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getEmployeesPaginated = function () {
        return __awaiter(this, arguments, void 0, function (page, limit, search, position, month) {
            var allEmployees, filteredEmployees, total, totalPages, offset, paginatedEmployees;
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 50; }
            if (search === void 0) { search = ""; }
            if (position === void 0) { position = ""; }
            if (month === void 0) { month = ""; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getEmployees()];
                    case 1:
                        allEmployees = _a.sent();
                        filteredEmployees = allEmployees;
                        if (search) {
                            filteredEmployees = filteredEmployees.filter(function (emp) {
                                return emp.name.toLowerCase().includes(search.toLowerCase());
                            });
                        }
                        if (position && position !== "all") {
                            filteredEmployees = filteredEmployees.filter(function (emp) {
                                return emp.position.toLowerCase().includes(position.toLowerCase());
                            });
                        }
                        if (month && month !== "all") {
                            filteredEmployees = filteredEmployees.filter(function (emp) {
                                var birthMonth = new Date(emp.birthDate + 'T00:00:00').getMonth() + 1;
                                return birthMonth.toString() === month;
                            });
                        }
                        // Sort by next birthday
                        filteredEmployees.sort(function (a, b) {
                            var getNextBirthday = function (birthDate) {
                                var birth = new Date(birthDate + 'T00:00:00');
                                var today = new Date();
                                var thisYear = today.getFullYear();
                                var nextBirthday = new Date(thisYear, birth.getMonth(), birth.getDate());
                                var todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                                if (nextBirthday < todayDateOnly) {
                                    nextBirthday = new Date(thisYear + 1, birth.getMonth(), birth.getDate());
                                }
                                var diffTime = nextBirthday.getTime() - todayDateOnly.getTime();
                                return Math.round(diffTime / (1000 * 60 * 60 * 24));
                            };
                            var daysA = getNextBirthday(a.birthDate);
                            var daysB = getNextBirthday(b.birthDate);
                            if (daysA === daysB) {
                                return a.name.localeCompare(b.name);
                            }
                            return daysA - daysB;
                        });
                        total = filteredEmployees.length;
                        totalPages = Math.ceil(total / limit);
                        offset = (page - 1) * limit;
                        paginatedEmployees = filteredEmployees.slice(offset, offset + limit);
                        return [2 /*return*/, {
                                employees: paginatedEmployees,
                                pagination: {
                                    page: page,
                                    limit: limit,
                                    total: total,
                                    totalPages: totalPages,
                                    hasNext: page < totalPages,
                                    hasPrev: page > 1
                                }
                            }];
                }
            });
        });
    };
    DatabaseStorage.prototype.getEmployee = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.select().from(employees).where(eq(employees.id, id))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.createEmployee = function (employee) {
        return __awaiter(this, void 0, void 0, function () {
            var id, newEmployee, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = randomUUID();
                        newEmployee = __assign(__assign({}, employee), { id: id });
                        return [4 /*yield*/, this.db.insert(employees).values(newEmployee).returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateEmployee = function (id, employee) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.update(employees).set(employee).where(eq(employees.id, id)).returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteEmployee = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.db.delete(employees).where(eq(employees.id, id))];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, ((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0];
                }
            });
        });
    };
    // Contact operations
    DatabaseStorage.prototype.getContacts = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.select().from(contacts)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getContact = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.select().from(contacts).where(eq(contacts.id, id))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.createContact = function (contact) {
        return __awaiter(this, void 0, void 0, function () {
            var id, newContact, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = randomUUID();
                        newContact = __assign(__assign({}, contact), { id: id, isActive: (_a = contact.isActive) !== null && _a !== void 0 ? _a : true });
                        return [4 /*yield*/, this.db.insert(contacts).values(newContact).returning()];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateContact = function (id, contact) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.update(contacts).set(contact).where(eq(contacts.id, id)).returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteContact = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.db.delete(contacts).where(eq(contacts.id, id))];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, ((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0];
                }
            });
        });
    };
    // Message operations
    DatabaseStorage.prototype.getMessages = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.select().from(messages)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getMessage = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.select().from(messages).where(eq(messages.id, id))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.createMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var id, newMessage, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = randomUUID();
                        newMessage = __assign(__assign({}, message), { id: id, scheduledFor: message.scheduledFor || null, sentAt: message.sentAt || null, errorMessage: message.errorMessage || null });
                        return [4 /*yield*/, this.db.insert(messages).values(newMessage).returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateMessage = function (id, message) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.update(messages).set(message).where(eq(messages.id, id)).returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteMessage = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.db.delete(messages).where(eq(messages.id, id))];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, ((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0];
                }
            });
        });
    };
    // Settings operations
    DatabaseStorage.prototype.getSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.select().from(settings).limit(1)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DatabaseStorage.prototype.createOrUpdateSettings = function (insertSettings) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, result, id, newSettings, result;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.getSettings()];
                    case 1:
                        existing = _c.sent();
                        if (!existing) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.db.update(settings)
                                .set(__assign(__assign({}, insertSettings), { reminderTime: insertSettings.reminderTime || "08:00", birthdayTime: insertSettings.birthdayTime || "09:00", weekendsEnabled: (_a = insertSettings.weekendsEnabled) !== null && _a !== void 0 ? _a : true, retryAttempts: insertSettings.retryAttempts || 2, retryInterval: insertSettings.retryInterval || 5 }))
                                .where(eq(settings.id, existing.id))
                                .returning()];
                    case 2:
                        result = _c.sent();
                        return [2 /*return*/, result[0]];
                    case 3:
                        id = randomUUID();
                        newSettings = __assign(__assign({}, insertSettings), { id: id, reminderTime: insertSettings.reminderTime || "08:00", birthdayTime: insertSettings.birthdayTime || "09:00", weekendsEnabled: (_b = insertSettings.weekendsEnabled) !== null && _b !== void 0 ? _b : true, retryAttempts: insertSettings.retryAttempts || 2, retryInterval: insertSettings.retryInterval || 5 });
                        return [4 /*yield*/, this.db.insert(settings).values(newSettings).returning()];
                    case 4:
                        result = _c.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    // User methods
    DatabaseStorage.prototype.createUser = function (userData) {
        return __awaiter(this, void 0, void 0, function () {
            var saltRounds, hashedPassword, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        saltRounds = 10;
                        return [4 /*yield*/, bcrypt.hash(userData.password, saltRounds)];
                    case 1:
                        hashedPassword = _a.sent();
                        return [4 /*yield*/, this.db.insert(users).values(__assign(__assign({}, userData), { username: userData.username.toLowerCase().trim(), password: hashedPassword })).returning()];
                    case 2:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserByUsername = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db
                            .select()
                            .from(users)
                            .where(and(eq(users.username, username.toLowerCase().trim()), eq(users.isActive, true)))
                            .limit(1)];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user || null];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db
                            .select()
                            .from(users)
                            .where(eq(users.id, id))
                            .limit(1)];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user || null];
                }
            });
        });
    };
    DatabaseStorage.prototype.validateUserPassword = function (username, password) {
        return __awaiter(this, void 0, void 0, function () {
            var user, isValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.select()
                            .from(users)
                            .where(eq(users.username, username.toLowerCase().trim()))
                            .limit(1)];
                    case 1:
                        user = (_a.sent())[0];
                        if (!user) {
                            console.log('🔍 Usuário não encontrado:', username);
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, bcrypt.compare(password, user.password)];
                    case 2:
                        isValid = _a.sent();
                        console.log('🔐 Senha válida:', isValid);
                        if (!isValid) {
                            return [2 /*return*/, null];
                        }
                        // Update last login
                        return [4 /*yield*/, this.db
                                .update(users)
                                .set({ lastLogin: new Date() })
                                .where(eq(users.id, user.id))];
                    case 3:
                        // Update last login
                        _a.sent();
                        return [2 /*return*/, user];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db
                            .select()
                            .from(users)
                            .where(eq(users.isActive, true))
                            .orderBy(users.username)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateUser = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updateData, _a, user;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        updateData = __assign({}, data);
                        if (!updateData.password) return [3 /*break*/, 2];
                        _a = updateData;
                        return [4 /*yield*/, bcrypt.hash(updateData.password, 10)];
                    case 1:
                        _a.password = _b.sent();
                        _b.label = 2;
                    case 2:
                        if (updateData.username) {
                            updateData.username = updateData.username.toLowerCase().trim();
                        }
                        return [4 /*yield*/, this.db
                                .update(users)
                                .set(updateData)
                                .where(eq(users.id, id))
                                .returning()];
                    case 3:
                        user = (_b.sent())[0];
                        return [2 /*return*/, user || null];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db
                            .update(users)
                            .set({ isActive: false })
                            .where(eq(users.id, id))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rowCount > 0];
                }
            });
        });
    };
    DatabaseStorage.prototype.createDefaultUser = function () {
        return __awaiter(this, void 0, void 0, function () {
            var existingAdmin, adminUser, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getUserByUsername('admin')];
                    case 1:
                        existingAdmin = _a.sent();
                        if (existingAdmin) {
                            console.log('✅ Usuário admin já existe');
                            return [2 /*return*/];
                        }
                        console.log('🔧 Criando usuário admin padrão...');
                        return [4 /*yield*/, this.createUser({
                                username: 'admin',
                                email: 'admin@example.com',
                                password: 'admin123',
                                role: 'admin'
                            })];
                    case 2:
                        adminUser = _a.sent();
                        console.log('✅ Usuário admin criado com sucesso:', adminUser.username);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('❌ Erro ao criar usuário admin padrão:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return DatabaseStorage;
}());
export { DatabaseStorage };
// Initialize storage with Supabase, with retry mechanism
function initializeStorage() {
    return __awaiter(this, void 0, void 0, function () {
        var urlParts, hostPart, dbStorage, maxRetries, lastError, attempt, timeoutPromise, connectionTestPromise, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!process.env.DATABASE_URL) {
                        console.error('❌ DATABASE_URL não encontrada nas variáveis de ambiente');
                        console.error('Por favor, configure a DATABASE_URL do Supabase');
                        throw new Error('DATABASE_URL environment variable is required for Supabase connection');
                    }
                    console.log('🔗 Conectando ao Supabase...');
                    console.log('Database URL exists:', !!process.env.DATABASE_URL);
                    console.log('Database URL format check:', ((_a = process.env.DATABASE_URL) === null || _a === void 0 ? void 0 : _a.startsWith('postgresql://')) ? 'Valid PostgreSQL URL' : 'Invalid URL format');
                    urlParts = process.env.DATABASE_URL.split('@');
                    if (urlParts.length > 1) {
                        hostPart = urlParts[urlParts.length - 1].split('/')[0];
                        console.log('Connecting to host:', hostPart);
                    }
                    else {
                        console.log('URL parsing issue - no @ found in expected position');
                    }
                    dbStorage = new DatabaseStorage();
                    maxRetries = 3;
                    attempt = 1;
                    _b.label = 1;
                case 1:
                    if (!(attempt <= maxRetries)) return [3 /*break*/, 9];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 5, , 8]);
                    console.log("Tentativa ".concat(attempt, "/").concat(maxRetries, " de conex\u00E3o..."));
                    timeoutPromise = new Promise(function (_, reject) {
                        setTimeout(function () { return reject(new Error('Connection timeout')); }, 10000);
                    });
                    connectionTestPromise = dbStorage.getSettings();
                    return [4 /*yield*/, Promise.race([connectionTestPromise, timeoutPromise])];
                case 3:
                    _b.sent();
                    console.log('✅ Conectado ao Supabase com sucesso!');
                    // Create default admin user after successful connection
                    return [4 /*yield*/, dbStorage.createDefaultUser()];
                case 4:
                    // Create default admin user after successful connection
                    _b.sent();
                    return [2 /*return*/, dbStorage]; // Connection successful, exit the loop
                case 5:
                    error_2 = _b.sent();
                    lastError = error_2;
                    console.error("\u274C Tentativa ".concat(attempt, " falhou:"), error_2.message);
                    if (!(attempt < maxRetries)) return [3 /*break*/, 7];
                    console.log("Aguardando 2s antes da pr\u00F3xima tentativa...");
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 6:
                    _b.sent();
                    _b.label = 7;
                case 7: return [3 /*break*/, 8];
                case 8:
                    attempt++;
                    return [3 /*break*/, 1];
                case 9:
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
                    throw new Error("Falha na conex\u00E3o com Supabase ap\u00F3s ".concat(maxRetries, " tentativas: ").concat(lastError.message));
            }
        });
    });
}
// Initialize storage asynchronously
var storage;
var storagePromise = initializeStorage().then(function (s) {
    storage = s;
    return s;
});
export { storage, storagePromise };
