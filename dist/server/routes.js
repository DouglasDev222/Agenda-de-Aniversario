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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { createServer } from "http";
import { storage, storagePromise } from "./storage";
import { whatsappService } from "./services/whatsapp";
import { schedulerService } from "./services/scheduler";
import { insertEmployeeSchema, insertContactSchema, insertSettingsSchema, insertUserSchema, loginSchema } from "@shared/schema";
import { authenticateToken, requireAdmin, requireManagement, generateToken } from "./middleware/auth";
export function registerRoutes(app) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1, httpServer;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Initialize storage first
                return [4 /*yield*/, storagePromise];
                case 1:
                    // Initialize storage first
                    _a.sent();
                    console.log('Storage initialized successfully');
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    console.log('Initializing WhatsApp service...');
                    return [4 /*yield*/, whatsappService.initialize()];
                case 3:
                    _a.sent();
                    console.log('Initializing scheduler service...');
                    return [4 /*yield*/, schedulerService.initialize()];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error('Failed to initialize services:', error_1);
                    return [3 /*break*/, 6];
                case 6:
                    // Authentication routes
                    app.post("/api/auth/login", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var result, _a, username, password, user, token, _, userWithoutPassword, error_2;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    console.log('🔐 Tentativa de login:', req.body);
                                    result = loginSchema.safeParse(req.body);
                                    if (!result.success) {
                                        console.log('❌ Dados inválidos:', result.error);
                                        return [2 /*return*/, res.status(400).json({ error: "Dados inválidos", details: result.error })];
                                    }
                                    _a = result.data, username = _a.username, password = _a.password;
                                    console.log('🔍 Validando usuário:', username);
                                    return [4 /*yield*/, storage.validateUserPassword(username, password)];
                                case 1:
                                    user = _b.sent();
                                    if (!user) {
                                        console.log('❌ Credenciais inválidas para usuário:', username);
                                        return [2 /*return*/, res.status(401).json({ error: "Credenciais inválidas" })];
                                    }
                                    console.log('✅ Login bem-sucedido para usuário:', username);
                                    token = generateToken(user.id);
                                    _ = user.password, userWithoutPassword = __rest(user, ["password"]);
                                    res.json({
                                        token: token,
                                        user: userWithoutPassword
                                    });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_2 = _b.sent();
                                    console.error('💥 Erro no login:', error_2);
                                    res.status(500).json({ error: "Erro interno do servidor" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/api/auth/me", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, _, userWithoutPassword;
                        return __generator(this, function (_b) {
                            _a = req.user, _ = _a.password, userWithoutPassword = __rest(_a, ["password"]);
                            res.json(userWithoutPassword);
                            return [2 /*return*/];
                        });
                    }); });
                    app.post("/api/auth/logout", authenticateToken, function (_req, res) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            res.json({ message: "Logout realizado com sucesso" });
                            return [2 /*return*/];
                        });
                    }); });
                    // User management routes (admin only)
                    app.get("/api/users", authenticateToken, requireAdmin, function (_req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var users, usersWithoutPassword, error_3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, storage.getUsers()];
                                case 1:
                                    users = _a.sent();
                                    usersWithoutPassword = users.map(function (_a) {
                                        var _ = _a.password, user = __rest(_a, ["password"]);
                                        return user;
                                    });
                                    res.json(usersWithoutPassword);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_3 = _a.sent();
                                    res.status(500).json({ error: "Falha ao buscar usuários" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/users", authenticateToken, requireAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var result, user, _, userWithoutPassword, error_4;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    result = insertUserSchema.safeParse(req.body);
                                    if (!result.success) {
                                        return [2 /*return*/, res.status(400).json({ error: "Dados inválidos", details: result.error })];
                                    }
                                    return [4 /*yield*/, storage.createUser(result.data)];
                                case 1:
                                    user = _a.sent();
                                    _ = user.password, userWithoutPassword = __rest(user, ["password"]);
                                    res.status(201).json(userWithoutPassword);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_4 = _a.sent();
                                    res.status(500).json({ error: "Falha ao criar usuário" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.put("/api/users/:id", authenticateToken, requireAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var result, user, _, userWithoutPassword, error_5;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    console.log('📝 Atualizando usuário:', req.params.id, 'Dados:', req.body);
                                    result = insertUserSchema.partial().safeParse(req.body);
                                    if (!result.success) {
                                        console.log('❌ Dados inválidos:', result.error);
                                        return [2 /*return*/, res.status(400).json({ error: "Dados inválidos", details: result.error })];
                                    }
                                    return [4 /*yield*/, storage.updateUser(req.params.id, result.data)];
                                case 1:
                                    user = _a.sent();
                                    if (!user) {
                                        console.log('❌ Usuário não encontrado:', req.params.id);
                                        return [2 /*return*/, res.status(404).json({ error: "Usuário não encontrado" })];
                                    }
                                    console.log('✅ Usuário atualizado com sucesso:', user.username);
                                    _ = user.password, userWithoutPassword = __rest(user, ["password"]);
                                    res.json(userWithoutPassword);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_5 = _a.sent();
                                    console.error('💥 Erro ao atualizar usuário:', error_5);
                                    res.status(500).json({ error: "Falha ao atualizar usuário" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Employee routes
                    app.get("/api/employees", authenticateToken, requireManagement, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var page, limit, search, position, month, result, error_6;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    page = parseInt(req.query.page) || 1;
                                    limit = parseInt(req.query.limit) || 50;
                                    search = req.query.search || "";
                                    position = req.query.position || "";
                                    month = req.query.month || "";
                                    return [4 /*yield*/, storage.getEmployeesPaginated(page, limit, search, position, month)];
                                case 1:
                                    result = _a.sent();
                                    res.json(result);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_6 = _a.sent();
                                    res.status(500).json({ error: "Failed to fetch employees" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/employees", authenticateToken, requireManagement, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var result, employee, error_7;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    result = insertEmployeeSchema.safeParse(req.body);
                                    if (!result.success) {
                                        return [2 /*return*/, res.status(400).json({ error: "Invalid employee data", details: result.error })];
                                    }
                                    return [4 /*yield*/, storage.createEmployee(result.data)];
                                case 1:
                                    employee = _a.sent();
                                    res.status(201).json(employee);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_7 = _a.sent();
                                    res.status(500).json({ error: "Failed to create employee" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.put("/api/employees/:id", authenticateToken, requireManagement, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var result, employee, error_8;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    result = insertEmployeeSchema.partial().safeParse(req.body);
                                    if (!result.success) {
                                        return [2 /*return*/, res.status(400).json({ error: "Invalid employee data", details: result.error })];
                                    }
                                    return [4 /*yield*/, storage.updateEmployee(req.params.id, result.data)];
                                case 1:
                                    employee = _a.sent();
                                    if (!employee) {
                                        return [2 /*return*/, res.status(404).json({ error: "Employee not found" })];
                                    }
                                    res.json(employee);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_8 = _a.sent();
                                    res.status(500).json({ error: "Failed to update employee" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.delete("/api/employees/:id", authenticateToken, requireManagement, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var success, error_9;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, storage.deleteEmployee(req.params.id)];
                                case 1:
                                    success = _a.sent();
                                    if (!success) {
                                        return [2 /*return*/, res.status(404).json({ error: "Employee not found" })];
                                    }
                                    res.status(204).send();
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_9 = _a.sent();
                                    res.status(500).json({ error: "Failed to delete employee" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Contact routes
                    app.get("/api/contacts", authenticateToken, requireManagement, function (_req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var contacts, error_10;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, storage.getContacts()];
                                case 1:
                                    contacts = _a.sent();
                                    res.json(contacts);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_10 = _a.sent();
                                    res.status(500).json({ error: "Failed to fetch contacts" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/contacts", authenticateToken, requireManagement, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var result, contact, error_11;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    result = insertContactSchema.safeParse(req.body);
                                    if (!result.success) {
                                        return [2 /*return*/, res.status(400).json({ error: "Invalid contact data", details: result.error })];
                                    }
                                    return [4 /*yield*/, storage.createContact(result.data)];
                                case 1:
                                    contact = _a.sent();
                                    res.status(201).json(contact);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_11 = _a.sent();
                                    res.status(500).json({ error: "Failed to create contact" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.put("/api/contacts/:id", authenticateToken, requireManagement, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var result, contact, error_12;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    result = insertContactSchema.partial().safeParse(req.body);
                                    if (!result.success) {
                                        return [2 /*return*/, res.status(400).json({ error: "Invalid contact data", details: result.error })];
                                    }
                                    return [4 /*yield*/, storage.updateContact(req.params.id, result.data)];
                                case 1:
                                    contact = _a.sent();
                                    if (!contact) {
                                        return [2 /*return*/, res.status(404).json({ error: "Contact not found" })];
                                    }
                                    res.json(contact);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_12 = _a.sent();
                                    res.status(500).json({ error: "Failed to update contact" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.delete("/api/contacts/:id", authenticateToken, requireManagement, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var success, error_13;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, storage.deleteContact(req.params.id)];
                                case 1:
                                    success = _a.sent();
                                    if (!success) {
                                        return [2 /*return*/, res.status(404).json({ error: "Contact not found" })];
                                    }
                                    res.status(204).send();
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_13 = _a.sent();
                                    res.status(500).json({ error: "Failed to delete contact" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Messages routes
                    app.get("/api/messages", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var page, limit, status_1, allMessages, filteredMessages, total, totalPages, offset, paginatedMessages, hasNext, hasPrev, error_14;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    page = parseInt(req.query.page) || 1;
                                    limit = parseInt(req.query.limit) || 10;
                                    status_1 = req.query.status;
                                    return [4 /*yield*/, storage.getMessages()];
                                case 1:
                                    allMessages = _a.sent();
                                    filteredMessages = allMessages;
                                    if (status_1 && status_1 !== 'all') {
                                        filteredMessages = allMessages.filter(function (msg) { return msg.status === status_1; });
                                    }
                                    // Sort by creation date (newest first)
                                    filteredMessages.sort(function (a, b) {
                                        var dateA = a.sentAt || a.scheduledFor || new Date(0);
                                        var dateB = b.sentAt || b.scheduledFor || new Date(0);
                                        return new Date(dateB).getTime() - new Date(dateA).getTime();
                                    });
                                    total = filteredMessages.length;
                                    totalPages = Math.ceil(total / limit);
                                    offset = (page - 1) * limit;
                                    paginatedMessages = filteredMessages.slice(offset, offset + limit);
                                    hasNext = page < totalPages;
                                    hasPrev = page > 1;
                                    res.json({
                                        messages: paginatedMessages,
                                        pagination: {
                                            page: page,
                                            limit: limit,
                                            total: total,
                                            totalPages: totalPages,
                                            hasNext: hasNext,
                                            hasPrev: hasPrev,
                                        }
                                    });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_14 = _a.sent();
                                    console.error("Error fetching messages:", error_14);
                                    res.status(500).json({ error: "Failed to fetch messages" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Settings routes
                    app.get("/api/settings", authenticateToken, requireAdmin, function (_req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var settings, error_15;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, storage.getSettings()];
                                case 1:
                                    settings = _a.sent();
                                    if (!settings) {
                                        return [2 /*return*/, res.status(404).json({ error: "Settings not found" })];
                                    }
                                    res.json(settings);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_15 = _a.sent();
                                    res.status(500).json({ error: "Failed to fetch settings" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/settings", authenticateToken, requireAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var result, settings, error_16;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 3, , 4]);
                                    result = insertSettingsSchema.safeParse(req.body);
                                    if (!result.success) {
                                        return [2 /*return*/, res.status(400).json({ error: "Invalid settings data", details: result.error })];
                                    }
                                    return [4 /*yield*/, storage.createOrUpdateSettings(result.data)];
                                case 1:
                                    settings = _a.sent();
                                    // Update scheduler with new settings
                                    return [4 /*yield*/, schedulerService.updateSchedules()];
                                case 2:
                                    // Update scheduler with new settings
                                    _a.sent();
                                    res.json(settings);
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_16 = _a.sent();
                                    res.status(500).json({ error: "Failed to save settings" });
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    // WhatsApp connection routes
                    app.get("/api/whatsapp/status", authenticateToken, requireAdmin, function (_req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var status_2;
                        return __generator(this, function (_a) {
                            try {
                                status_2 = whatsappService.getConnectionStatus();
                                res.json(status_2);
                            }
                            catch (error) {
                                res.status(500).json({ error: "Failed to get WhatsApp status" });
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    app.post("/api/whatsapp/connect", authenticateToken, requireAdmin, function (_req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var status_3, error_17;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, whatsappService.initialize()];
                                case 1:
                                    _a.sent();
                                    status_3 = whatsappService.getConnectionStatus();
                                    res.json(status_3);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_17 = _a.sent();
                                    res.status(500).json({ error: "Failed to initialize WhatsApp connection" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/whatsapp/refresh-qr", authenticateToken, requireAdmin, function (_req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var qrCode, error_18;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, whatsappService.refreshQRCode()];
                                case 1:
                                    qrCode = _a.sent();
                                    res.json({ qrCode: qrCode });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_18 = _a.sent();
                                    res.status(500).json({ error: "Failed to refresh QR code" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/whatsapp/enable-simulation", authenticateToken, requireAdmin, function (_req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var status_4, error_19;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, whatsappService.enableSimulationMode()];
                                case 1:
                                    _a.sent();
                                    status_4 = whatsappService.getConnectionStatus();
                                    res.json(status_4);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_19 = _a.sent();
                                    res.status(500).json({ error: "Failed to enable simulation mode" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/whatsapp/enable-real", authenticateToken, requireAdmin, function (_req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var status_5, error_20;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, whatsappService.enableRealMode()];
                                case 1:
                                    _a.sent();
                                    status_5 = whatsappService.getConnectionStatus();
                                    res.json(status_5);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_20 = _a.sent();
                                    res.status(500).json({ error: "Failed to enable real mode" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/whatsapp/force-cleanup", authenticateToken, requireAdmin, function (_req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var status_6, error_21;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, whatsappService.forceCleanAuth()];
                                case 1:
                                    _a.sent();
                                    status_6 = whatsappService.getConnectionStatus();
                                    res.json(status_6);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_21 = _a.sent();
                                    res.status(500).json({ error: "Failed to enable real mode" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // New Baileys-specific routes
                    app.get("/api/whatsapp/profile-picture/:phoneNumber", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var phoneNumber, profilePicture, error_22;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    phoneNumber = req.params.phoneNumber;
                                    return [4 /*yield*/, whatsappService.getProfilePicture(phoneNumber)];
                                case 1:
                                    profilePicture = _a.sent();
                                    res.json({ profilePicture: profilePicture });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_22 = _a.sent();
                                    res.status(500).json({ error: "Failed to get profile picture" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/api/whatsapp/status/:phoneNumber", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var phoneNumber, status_7, error_23;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    phoneNumber = req.params.phoneNumber;
                                    return [4 /*yield*/, whatsappService.getStatus(phoneNumber)];
                                case 1:
                                    status_7 = _a.sent();
                                    res.json({ status: status_7 });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_23 = _a.sent();
                                    res.status(500).json({ error: "Failed to get status" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/whatsapp/send-media", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, phoneNumber, url, caption, success, error_24;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    _a = req.body, phoneNumber = _a.phoneNumber, url = _a.url, caption = _a.caption;
                                    return [4 /*yield*/, whatsappService.sendMediaFromUrl(phoneNumber, url, caption)];
                                case 1:
                                    success = _b.sent();
                                    res.json({ success: success });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_24 = _b.sent();
                                    res.status(500).json({ error: "Failed to send media" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/whatsapp/send-location", authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, phoneNumber, latitude, longitude, name_1, success, error_25;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    _a = req.body, phoneNumber = _a.phoneNumber, latitude = _a.latitude, longitude = _a.longitude, name_1 = _a.name;
                                    return [4 /*yield*/, whatsappService.sendLocation(phoneNumber, latitude, longitude, name_1)];
                                case 1:
                                    success = _b.sent();
                                    res.json({ success: success });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_25 = _b.sent();
                                    res.status(500).json({ error: "Failed to enable real mode" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/whatsapp/test-connection", authenticateToken, requireAdmin, function (_req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var connectionResult, error_26;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, whatsappService.testConnection()];
                                case 1:
                                    connectionResult = _a.sent();
                                    res.json(connectionResult);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_26 = _a.sent();
                                    res.status(500).json({ error: "Failed to test WhatsApp connection" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/whatsapp/send-test", authenticateToken, requireAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, phoneNumber, message, success, error_27;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    _a = req.body, phoneNumber = _a.phoneNumber, message = _a.message;
                                    if (!phoneNumber || !message) {
                                        return [2 /*return*/, res.status(400).json({ error: "Phone number and message are required" })];
                                    }
                                    console.log("\uD83E\uDDEA Teste manual: Enviando mensagem para ".concat(phoneNumber));
                                    console.log("\uD83D\uDCDD Conte\u00FAdo: ".concat(message));
                                    return [4 /*yield*/, whatsappService.sendMessage(phoneNumber, message)];
                                case 1:
                                    success = _b.sent();
                                    if (success) {
                                        console.log("\u2705 Teste manual: Mensagem enviada com sucesso para ".concat(phoneNumber));
                                        res.json({ success: true, message: "Test message sent successfully" });
                                    }
                                    else {
                                        console.log("\u274C Teste manual: Falha no envio para ".concat(phoneNumber));
                                        res.status(500).json({ error: "Failed to send test message" });
                                    }
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_27 = _b.sent();
                                    console.log("\uD83D\uDCA5 Teste manual: Erro no envio para ".concat(phoneNumber, ":"), error_27);
                                    res.status(500).json({ error: "Failed to send test message" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/whatsapp/check-number", authenticateToken, requireAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var phoneNumber, formattedNumber, originalFormatted, ddd, numero, chatId;
                        return __generator(this, function (_a) {
                            try {
                                phoneNumber = req.body.phoneNumber;
                                if (!phoneNumber) {
                                    return [2 /*return*/, res.status(400).json({ error: "Phone number is required" })];
                                }
                                formattedNumber = phoneNumber.replace(/\D/g, '');
                                originalFormatted = formattedNumber;
                                // Aplicar formatação completa
                                if (formattedNumber.length === 10) {
                                    ddd = formattedNumber.substring(0, 2);
                                    numero = formattedNumber.substring(2);
                                    formattedNumber = ddd + '9' + numero;
                                }
                                if (formattedNumber.length === 11 && !formattedNumber.startsWith('55')) {
                                    // Adicionar código do país
                                    formattedNumber = '55' + formattedNumber;
                                }
                                chatId = formattedNumber + '@c.us';
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
                            }
                            catch (error) {
                                res.status(500).json({ error: "Failed to check number format" });
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    // Debug endpoint to check contacts
                    app.get("/api/debug/contacts", authenticateToken, requireAdmin, function (_req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var contacts, activeContacts, error_28;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, storage.getContacts()];
                                case 1:
                                    contacts = _a.sent();
                                    activeContacts = contacts.filter(function (c) { return c.isActive; });
                                    console.log("\uD83D\uDD0D DEBUG - Total de contatos: ".concat(contacts.length));
                                    console.log("\uD83D\uDD0D DEBUG - Contatos ativos: ".concat(activeContacts.length));
                                    contacts.forEach(function (contact) {
                                        console.log("\uD83D\uDCC7 Contato: ".concat(contact.name, " | Telefone: ").concat(contact.phone, " | Ativo: ").concat(contact.isActive, " | Fun\u00E7\u00E3o: ").concat(contact.role));
                                    });
                                    res.json({
                                        totalContacts: contacts.length,
                                        activeContacts: activeContacts.length,
                                        contacts: contacts.map(function (c) { return ({
                                            id: c.id,
                                            name: c.name,
                                            phone: c.phone,
                                            role: c.role,
                                            isActive: c.isActive
                                        }); })
                                    });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_28 = _a.sent();
                                    res.status(500).json({ error: "Failed to fetch contacts for debug" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Stats endpoint for dashboard
                    app.get("/api/stats", authenticateToken, requireManagement, function (_req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var employees, messages_1, now, todayBrazil_1, thisMonth_1, totalEmployees, thisMonthBirthdays, todayBirthdays, messagesSent, upcomingBirthdays, recentMessages, error_29;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 3, , 4]);
                                    return [4 /*yield*/, storage.getEmployees()];
                                case 1:
                                    employees = _a.sent();
                                    return [4 /*yield*/, storage.getMessages()];
                                case 2:
                                    messages_1 = _a.sent();
                                    now = new Date();
                                    todayBrazil_1 = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
                                    thisMonth_1 = todayBrazil_1.getMonth();
                                    totalEmployees = employees.length;
                                    thisMonthBirthdays = employees.filter(function (emp) {
                                        var birthDate = new Date(emp.birthDate + 'T00:00:00');
                                        return birthDate.getMonth() === thisMonth_1;
                                    }).length;
                                    todayBirthdays = employees.filter(function (emp) {
                                        var birthDate = new Date(emp.birthDate + 'T00:00:00');
                                        return birthDate.getMonth() === todayBrazil_1.getMonth() &&
                                            birthDate.getDate() === todayBrazil_1.getDate();
                                    }).length;
                                    messagesSent = messages_1.filter(function (msg) { return msg.status === 'sent'; }).length;
                                    upcomingBirthdays = employees
                                        .map(function (emp) {
                                        // Usar fuso horário brasileiro para data atual
                                        var now = new Date();
                                        var todayBrazil = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
                                        var birthDate = new Date(emp.birthDate + 'T00:00:00');
                                        var thisYearBirthday = new Date(todayBrazil.getFullYear(), birthDate.getMonth(), birthDate.getDate());
                                        // Se o aniversário já passou este ano, calcular para o próximo ano
                                        var todayOnly = new Date(todayBrazil.getFullYear(), todayBrazil.getMonth(), todayBrazil.getDate());
                                        if (thisYearBirthday < todayOnly) {
                                            thisYearBirthday.setFullYear(todayBrazil.getFullYear() + 1);
                                        }
                                        var daysUntil = Math.ceil((thisYearBirthday.getTime() - todayOnly.getTime()) / (1000 * 60 * 60 * 24));
                                        return {
                                            employee: emp,
                                            daysUntil: daysUntil,
                                            date: thisYearBirthday
                                        };
                                    })
                                        .filter(function (item) { return item.daysUntil <= 7; })
                                        .sort(function (a, b) { return a.daysUntil - b.daysUntil; });
                                    recentMessages = messages_1
                                        .filter(function (msg) { return msg.sentAt; })
                                        .sort(function (a, b) { return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime(); })
                                        .slice(0, 10);
                                    res.json({
                                        totalEmployees: totalEmployees,
                                        thisMonthBirthdays: thisMonthBirthdays,
                                        todayBirthdays: todayBirthdays,
                                        messagesSent: messagesSent,
                                        upcomingBirthdays: upcomingBirthdays,
                                        recentMessages: recentMessages
                                    });
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_29 = _a.sent();
                                    res.status(500).json({ error: "Failed to fetch stats" });
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    httpServer = createServer(app);
                    return [2 /*return*/, httpServer];
            }
        });
    });
}
