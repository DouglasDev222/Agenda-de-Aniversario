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
import * as cron from 'node-cron';
import { storage } from '../storage';
import { whatsappService } from './whatsapp';
var SchedulerService = /** @class */ (function () {
    function SchedulerService() {
        this.reminderJob = null;
        this.birthdayJob = null;
    }
    SchedulerService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.setupSchedules()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SchedulerService.prototype.setupSchedules = function () {
        return __awaiter(this, void 0, void 0, function () {
            var settings, reminderCron, birthdayCron;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, storage.getSettings()];
                    case 1:
                        settings = _a.sent();
                        if (!settings)
                            return [2 /*return*/];
                        // Stop existing jobs
                        this.stop();
                        reminderCron = this.timeToCron(settings.reminderTime);
                        this.reminderJob = cron.schedule(reminderCron, function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.checkReminderBirthdays()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        birthdayCron = this.timeToCron(settings.birthdayTime);
                        this.birthdayJob = cron.schedule(birthdayCron, function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.checkTodayBirthdays()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        console.log('Birthday scheduler initialized');
                        return [2 /*return*/];
                }
            });
        });
    };
    SchedulerService.prototype.timeToCron = function (time) {
        var _a = time.split(':'), hours = _a[0], minutes = _a[1];
        return "".concat(minutes, " ").concat(hours, " * * *");
    };
    SchedulerService.prototype.checkReminderBirthdays = function () {
        return __awaiter(this, void 0, void 0, function () {
            var settings, employees, contacts, activeContacts, now, brazilTime, tomorrow, _i, employees_1, employee, birthDate, birthDateBrazil;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, storage.getSettings()];
                    case 1:
                        settings = _a.sent();
                        if (!settings)
                            return [2 /*return*/];
                        return [4 /*yield*/, storage.getEmployees()];
                    case 2:
                        employees = _a.sent();
                        return [4 /*yield*/, storage.getContacts()];
                    case 3:
                        contacts = _a.sent();
                        activeContacts = contacts.filter(function (c) { return c.isActive; });
                        if (activeContacts.length === 0)
                            return [2 /*return*/];
                        now = new Date();
                        brazilTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
                        tomorrow = new Date(brazilTime);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        console.log("\uD83C\uDDE7\uD83C\uDDF7 Verificando lembretes para amanh\u00E3: ".concat(tomorrow.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })));
                        _i = 0, employees_1 = employees;
                        _a.label = 4;
                    case 4:
                        if (!(_i < employees_1.length)) return [3 /*break*/, 7];
                        employee = employees_1[_i];
                        birthDate = new Date(employee.birthDate + 'T00:00:00');
                        birthDateBrazil = new Date(birthDate.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
                        console.log("\uD83D\uDC64 ".concat(employee.name, " - Nascimento: ").concat(birthDateBrazil.toLocaleDateString('pt-BR'), " (m\u00EAs: ").concat(birthDateBrazil.getMonth(), ", dia: ").concat(birthDateBrazil.getDate(), ")"));
                        console.log("\uD83D\uDCC5 Amanh\u00E3: m\u00EAs ".concat(tomorrow.getMonth(), ", dia ").concat(tomorrow.getDate()));
                        if (!(birthDateBrazil.getMonth() === tomorrow.getMonth() &&
                            birthDateBrazil.getDate() === tomorrow.getDate())) return [3 /*break*/, 6];
                        console.log("\uD83C\uDF89 Lembrete: ".concat(employee.name, " faz anivers\u00E1rio amanh\u00E3!"));
                        // Skip weekends if disabled
                        if (!settings.weekendsEnabled && this.isWeekend(tomorrow)) {
                            console.log("\uD83D\uDCC5 Pulando fim de semana para ".concat(employee.name));
                            return [3 /*break*/, 6];
                        }
                        return [4 /*yield*/, this.sendReminderMessage(employee)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    SchedulerService.prototype.checkTodayBirthdays = function () {
        return __awaiter(this, void 0, void 0, function () {
            var settings, employees, contacts, activeContacts, now, today, _i, employees_2, employee, birthDate, birthDateBrazil;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, storage.getSettings()];
                    case 1:
                        settings = _a.sent();
                        if (!settings)
                            return [2 /*return*/];
                        return [4 /*yield*/, storage.getEmployees()];
                    case 2:
                        employees = _a.sent();
                        return [4 /*yield*/, storage.getContacts()];
                    case 3:
                        contacts = _a.sent();
                        activeContacts = contacts.filter(function (c) { return c.isActive; });
                        if (activeContacts.length === 0)
                            return [2 /*return*/];
                        now = new Date();
                        today = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
                        console.log("\uD83C\uDDE7\uD83C\uDDF7 Verificando anivers\u00E1rios de hoje: ".concat(today.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })));
                        _i = 0, employees_2 = employees;
                        _a.label = 4;
                    case 4:
                        if (!(_i < employees_2.length)) return [3 /*break*/, 7];
                        employee = employees_2[_i];
                        birthDate = new Date(employee.birthDate + "T00:00:00");
                        birthDateBrazil = new Date(birthDate.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
                        console.log("\uD83D\uDC64 ".concat(employee.name, " - Nascimento: ").concat(birthDateBrazil.toLocaleDateString("pt-BR"), " (m\u00EAs: ").concat(birthDateBrazil.getMonth(), ", dia: ").concat(birthDateBrazil.getDate(), ")"));
                        console.log("\uD83D\uDCC5 Hoje: m\u00EAs ".concat(today.getMonth(), ", dia ").concat(today.getDate()));
                        if (!(birthDateBrazil.getMonth() === today.getMonth() &&
                            birthDateBrazil.getDate() === today.getDate())) return [3 /*break*/, 6];
                        console.log("\uD83C\uDF82 Anivers\u00E1rio: ".concat(employee.name, " faz anivers\u00E1rio hoje!"));
                        // Skip weekends if disabled
                        if (!settings.weekendsEnabled && this.isWeekend(today)) {
                            console.log("\uD83D\uDCC5 Pulando fim de semana para ".concat(employee.name));
                            return [3 /*break*/, 6];
                        }
                        return [4 /*yield*/, this.sendBirthdayMessage(employee)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    SchedulerService.prototype.sendReminderMessage = function (employee) {
        return __awaiter(this, void 0, void 0, function () {
            var settings, contacts, activeContacts, message, _i, activeContacts_1, contact;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, storage.getSettings()];
                    case 1:
                        settings = _a.sent();
                        if (!settings)
                            return [2 /*return*/];
                        return [4 /*yield*/, storage.getContacts()];
                    case 2:
                        contacts = _a.sent();
                        activeContacts = contacts.filter(function (c) { return c.isActive; });
                        if (activeContacts.length === 0) {
                            console.log('⚠️ Nenhum contato de gerência ativo encontrado');
                            return [2 /*return*/];
                        }
                        console.log("\u23F0 Enviando lembrete para ".concat(employee.name, " aos contatos:"), activeContacts.map(function (c) { return "".concat(c.name, " (").concat(c.phone, ")"); }));
                        message = this.formatMessage(settings.reminderTemplate, employee);
                        _i = 0, activeContacts_1 = activeContacts;
                        _a.label = 3;
                    case 3:
                        if (!(_i < activeContacts_1.length)) return [3 /*break*/, 6];
                        contact = activeContacts_1[_i];
                        console.log("\uD83D\uDCE4 Preparando envio para: ".concat(contact.name, " - ").concat(contact.phone));
                        return [4 /*yield*/, this.sendMessageWithRetry(employee, contact, message, 'reminder', settings)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SchedulerService.prototype.sendBirthdayMessage = function (employee) {
        return __awaiter(this, void 0, void 0, function () {
            var settings, contacts, activeContacts, message, _i, activeContacts_2, contact;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, storage.getSettings()];
                    case 1:
                        settings = _a.sent();
                        if (!settings)
                            return [2 /*return*/];
                        return [4 /*yield*/, storage.getContacts()];
                    case 2:
                        contacts = _a.sent();
                        activeContacts = contacts.filter(function (c) { return c.isActive; });
                        if (activeContacts.length === 0) {
                            console.log('⚠️ Nenhum contato de gerência ativo encontrado');
                            return [2 /*return*/];
                        }
                        console.log("\uD83C\uDF82 Enviando mensagem de anivers\u00E1rio para ".concat(employee.name, " aos contatos:"), activeContacts.map(function (c) { return "".concat(c.name, " (").concat(c.phone, ")"); }));
                        message = this.formatMessage(settings.birthdayTemplate, employee);
                        _i = 0, activeContacts_2 = activeContacts;
                        _a.label = 3;
                    case 3:
                        if (!(_i < activeContacts_2.length)) return [3 /*break*/, 6];
                        contact = activeContacts_2[_i];
                        console.log("\uD83D\uDCE4 Preparando envio para: ".concat(contact.name, " - ").concat(contact.phone));
                        return [4 /*yield*/, this.sendMessageWithRetry(employee, contact, message, 'birthday', settings)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SchedulerService.prototype.sendMessageWithRetry = function (employee, contact, message, type, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var success, attempts, errorMessage, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        success = false;
                        attempts = 0;
                        errorMessage = '';
                        console.log("\uD83D\uDD04 Iniciando envio para: ".concat(contact.name, " (").concat(contact.phone, ") - Funcion\u00E1rio: ").concat(employee.name));
                        _a.label = 1;
                    case 1:
                        if (!(attempts < settings.retryAttempts && !success)) return [3 /*break*/, 11];
                        attempts++;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 8]);
                        console.log("\uD83D\uDCDE Tentativa ".concat(attempts, ": Enviando para ").concat(contact.phone));
                        return [4 /*yield*/, whatsappService.sendMessage(contact.phone, message)];
                    case 3:
                        success = _a.sent();
                        if (!success) return [3 /*break*/, 5];
                        console.log("\u2705 Mensagem enviada com sucesso para ".concat(contact.name, " (").concat(contact.phone, ")"));
                        // Log successful message
                        return [4 /*yield*/, storage.createMessage({
                                employeeId: employee.id,
                                contactId: contact.id,
                                type: type,
                                content: message,
                                status: 'sent',
                                scheduledFor: null,
                                sentAt: new Date(),
                                errorMessage: null,
                            })];
                    case 4:
                        // Log successful message
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        errorMessage = "Failed to send message (attempt ".concat(attempts, ")");
                        console.log("\u274C Falha no envio para ".concat(contact.name, " (").concat(contact.phone, "): ").concat(errorMessage));
                        _a.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_1 = _a.sent();
                        errorMessage = "Error: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error');
                        console.log("\u274C Erro no envio para ".concat(contact.name, " (").concat(contact.phone, "): ").concat(errorMessage));
                        return [3 /*break*/, 8];
                    case 8:
                        if (!(!success && attempts < settings.retryAttempts)) return [3 /*break*/, 10];
                        console.log("\u23F3 Aguardando ".concat(settings.retryInterval, " minutos antes da pr\u00F3xima tentativa..."));
                        // Wait before retry
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, settings.retryInterval * 60 * 1000); })];
                    case 9:
                        // Wait before retry
                        _a.sent();
                        _a.label = 10;
                    case 10: return [3 /*break*/, 1];
                    case 11:
                        if (!!success) return [3 /*break*/, 13];
                        console.log("\uD83D\uDCA5 Falha definitiva no envio para ".concat(contact.name, " (").concat(contact.phone, ")"));
                        // Log failed message
                        return [4 /*yield*/, storage.createMessage({
                                employeeId: employee.id,
                                contactId: contact.id,
                                type: type,
                                content: message,
                                status: 'failed',
                                scheduledFor: null,
                                sentAt: null,
                                errorMessage: errorMessage,
                            })];
                    case 12:
                        // Log failed message
                        _a.sent();
                        _a.label = 13;
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    SchedulerService.prototype.formatMessage = function (template, employee) {
        // Corrigir parsing da data de nascimento
        var birthDate = new Date(employee.birthDate + "T00:00:00");
        // Calcular idade considerando fuso horário brasileiro
        var now = new Date();
        var brazilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
        // Para cálculo da idade no aniversário (não idade atual)
        // Sempre usar o ano atual para calcular quantos anos a pessoa VAI COMPLETAR
        var ageOnBirthday = brazilTime.getFullYear() - birthDate.getFullYear();
        return template
            .replace(/\[NOME\]/g, employee.name)
            .replace(/\[CARGO\]/g, employee.position)
            .replace(/\[IDADE\]/g, ageOnBirthday.toString())
            .replace(/\[DATA_NASCIMENTO\]/g, birthDate.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }));
    };
    SchedulerService.prototype.isWeekend = function (date) {
        var day = date.getDay();
        return day === 0 || day === 6; // Sunday or Saturday
    };
    SchedulerService.prototype.updateSchedules = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.setupSchedules()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SchedulerService.prototype.stop = function () {
        if (this.reminderJob) {
            this.reminderJob.stop();
            this.reminderJob = null;
        }
        if (this.birthdayJob) {
            this.birthdayJob.stop();
            this.birthdayJob = null;
        }
    };
    return SchedulerService;
}());
export { SchedulerService };
export var schedulerService = new SchedulerService();
