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
// Use createRequire to import CommonJS modules in ES modules environment
import { createRequire } from 'module';
var require = createRequire(import.meta.url);
// Import Baileys using require
var _a = require('@whiskeysockets/baileys'), makeWASocket = _a.default, DisconnectReason = _a.DisconnectReason, useMultiFileAuthState = _a.useMultiFileAuthState, fetchLatestBaileysVersion = _a.fetchLatestBaileysVersion, WAMessageKey = _a.WAMessageKey, proto = _a.proto;
import P from 'pino';
import qrcode from 'qrcode-terminal';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
var BaileysWhatsAppService = /** @class */ (function () {
    function BaileysWhatsAppService() {
        this.sock = null;
        this.isConnected = false;
        this.qrCodeString = null;
        this.connectionStatus = 'disconnected';
        this.logger = P({ timestamp: function () { return ",\"time\":\"".concat(new Date().toJSON(), "\""); } }, P.destination('./wa-logs.txt'));
        this.logger.level = 'trace';
    }
    BaileysWhatsAppService.prototype.cleanAuthFolder = function () {
        return __awaiter(this, void 0, void 0, function () {
            var authPath;
            return __generator(this, function (_a) {
                authPath = path.resolve('./baileys_auth_info');
                try {
                    if (fs.existsSync(authPath)) {
                        console.log('🧹 Limpando pasta de autenticação...');
                        fs.rmSync(authPath, { recursive: true, force: true });
                        console.log('✅ Pasta de autenticação limpa com sucesso');
                    }
                }
                catch (error) {
                    console.error('❌ Erro ao limpar pasta de autenticação:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    BaileysWhatsAppService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, version, isLatest, _b, state, saveCreds, error_1;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log('🚀 Inicializando Baileys WhatsApp Service...');
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        this.connectionStatus = 'connecting';
                        return [4 /*yield*/, fetchLatestBaileysVersion()];
                    case 2:
                        _a = _c.sent(), version = _a.version, isLatest = _a.isLatest;
                        console.log("Using WA v".concat(version.join('.'), ", isLatest: ").concat(isLatest));
                        return [4 /*yield*/, useMultiFileAuthState('baileys_auth_info')];
                    case 3:
                        _b = _c.sent(), state = _b.state, saveCreds = _b.saveCreds;
                        // Create socket
                        this.sock = makeWASocket({
                            version: version,
                            logger: this.logger,
                            printQRInTerminal: false,
                            auth: state,
                            generateHighQualityLinkPreview: true,
                        });
                        // Handle connection updates
                        this.sock.ev.on('connection.update', function (update) { return __awaiter(_this, void 0, void 0, function () {
                            var connection, lastDisconnect, qr, _a, qrError_1, statusCode, errorMessage, authErrors, isConnectionFailure, needsAuthCleanup;
                            var _this = this;
                            var _b, _c, _d;
                            return __generator(this, function (_e) {
                                switch (_e.label) {
                                    case 0:
                                        connection = update.connection, lastDisconnect = update.lastDisconnect, qr = update.qr;
                                        if (!qr) return [3 /*break*/, 4];
                                        console.log('📱 QR Code recebido!');
                                        this.connectionStatus = 'waiting_qr';
                                        qrcode.generate(qr, { small: true });
                                        _e.label = 1;
                                    case 1:
                                        _e.trys.push([1, 3, , 4]);
                                        _a = this;
                                        return [4 /*yield*/, QRCode.toDataURL(qr)];
                                    case 2:
                                        _a.qrCodeString = _e.sent();
                                        console.log('📱 QR Code gerado para exibição web');
                                        return [3 /*break*/, 4];
                                    case 3:
                                        qrError_1 = _e.sent();
                                        console.error('❌ Erro ao gerar QR code para web:', qrError_1);
                                        this.qrCodeString = qr; // fallback to raw string
                                        return [3 /*break*/, 4];
                                    case 4:
                                        if (!(connection === 'close')) return [3 /*break*/, 8];
                                        statusCode = (_c = (_b = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _b === void 0 ? void 0 : _b.output) === null || _c === void 0 ? void 0 : _c.statusCode;
                                        errorMessage = ((_d = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _d === void 0 ? void 0 : _d.message) || '';
                                        console.log('❌ Conexão fechada devido a', lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error, 'Status code:', statusCode);
                                        this.isConnected = false;
                                        this.connectionStatus = 'disconnected';
                                        this.qrCodeString = null;
                                        authErrors = [
                                            DisconnectReason.loggedOut,
                                            DisconnectReason.badSession,
                                            DisconnectReason.unauthorized,
                                            DisconnectReason.forbidden
                                        ];
                                        isConnectionFailure = errorMessage.includes('Connection Failure') || statusCode === 401;
                                        needsAuthCleanup = authErrors.includes(statusCode) || isConnectionFailure;
                                        if (!needsAuthCleanup) return [3 /*break*/, 6];
                                        console.log('🔄 Erro de autenticação detectado - limpando credenciais...');
                                        return [4 /*yield*/, this.cleanAuthFolder()];
                                    case 5:
                                        _e.sent();
                                        // Don't auto-reconnect, user needs to manually connect to get new QR
                                        console.log('📱 Pasta de autenticação limpa. Use o endpoint /api/whatsapp/connect para gerar novo QR Code');
                                        return [3 /*break*/, 7];
                                    case 6:
                                        // Only reconnect for network errors, not auth errors
                                        console.log('🔄 Tentando reconectar em 5 segundos...');
                                        setTimeout(function () { return _this.initialize(); }, 5000);
                                        _e.label = 7;
                                    case 7: return [3 /*break*/, 9];
                                    case 8:
                                        if (connection === 'open') {
                                            console.log('✅ WhatsApp conectado com sucesso!');
                                            this.isConnected = true;
                                            this.connectionStatus = 'connected';
                                            this.qrCodeString = null;
                                        }
                                        _e.label = 9;
                                    case 9: return [2 /*return*/];
                                }
                            });
                        }); });
                        // Save credentials when updated
                        this.sock.ev.on('creds.update', saveCreds);
                        // Handle messages (optional for future features)
                        this.sock.ev.on('messages.upsert', function (m) {
                            console.log('📨 Nova mensagem recebida:', JSON.stringify(m, undefined, 2));
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _c.sent();
                        console.error('❌ Erro ao inicializar Baileys:', error_1);
                        this.connectionStatus = 'disconnected';
                        this.isConnected = false;
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    BaileysWhatsAppService.prototype.sendMessage = function (phoneNumber, message) {
        return __awaiter(this, void 0, void 0, function () {
            var formattedNumber, jid, result, checkError_1, sentMessage, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isConnected || !this.sock) {
                            throw new Error('WhatsApp is not connected');
                        }
                        console.log("\uD83C\uDFAF ENVIO DE MENSAGEM INICIADO:");
                        console.log("\uD83D\uDCDE N\u00FAmero de destino: ".concat(phoneNumber));
                        console.log("\uD83D\uDCAC Mensagem: ".concat(message.substring(0, 100), "..."));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        formattedNumber = phoneNumber.replace(/\D/g, '');
                        console.log("\uD83D\uDD04 N\u00FAmero original: ".concat(phoneNumber, ", Limpo: ").concat(formattedNumber));
                        // Add Brazil country code if not present
                        if (!formattedNumber.startsWith('55')) {
                            formattedNumber = '55' + formattedNumber;
                            console.log("\uD83C\uDDE7\uD83C\uDDF7 Adicionado c\u00F3digo do pa\u00EDs: ".concat(formattedNumber));
                        }
                        jid = formattedNumber + '@s.whatsapp.net';
                        console.log("\uD83D\uDCF1 JID final: ".concat(jid));
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.sock.onWhatsApp(jid)];
                    case 3:
                        result = (_a.sent())[0];
                        if (!result.exists) {
                            console.log("\u26A0\uFE0F N\u00FAmero ".concat(formattedNumber, " N\u00C3O est\u00E1 registrado no WhatsApp"));
                            return [2 /*return*/, false];
                        }
                        console.log("\u2705 N\u00FAmero ".concat(formattedNumber, " est\u00E1 registrado no WhatsApp"));
                        return [3 /*break*/, 5];
                    case 4:
                        checkError_1 = _a.sent();
                        console.log("\u26A0\uFE0F N\u00E3o foi poss\u00EDvel verificar se o n\u00FAmero est\u00E1 no WhatsApp:", checkError_1);
                        return [3 /*break*/, 5];
                    case 5:
                        console.log("\uD83D\uDCE4 Enviando mensagem via Baileys para ".concat(phoneNumber, " (").concat(jid, ")"));
                        return [4 /*yield*/, this.sock.sendMessage(jid, { text: message })];
                    case 6:
                        sentMessage = _a.sent();
                        console.log("\u2705 Mensagem enviada com sucesso para ".concat(phoneNumber, "!"));
                        console.log("\uD83D\uDCCB ID da mensagem: ".concat(sentMessage.key.id));
                        console.log("\uD83D\uDD50 Timestamp: ".concat(sentMessage.messageTimestamp));
                        return [2 /*return*/, true];
                    case 7:
                        error_2 = _a.sent();
                        console.error("\u274C Falha ao enviar mensagem para ".concat(phoneNumber, ":"), error_2);
                        return [2 /*return*/, false];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    BaileysWhatsAppService.prototype.testConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                console.log('🔍 Testando conexão WhatsApp Baileys');
                try {
                    if (!this.sock || !this.isConnected) {
                        return [2 /*return*/, {
                                connected: false,
                                status: 'disconnected',
                                realConnection: false
                            }];
                    }
                    user = this.sock.user;
                    console.log('📊 Usuário conectado:', (user === null || user === void 0 ? void 0 : user.name) || (user === null || user === void 0 ? void 0 : user.id));
                    return [2 /*return*/, {
                            connected: true,
                            status: 'connected',
                            realConnection: true
                        }];
                }
                catch (error) {
                    console.error('❌ Erro ao testar conexão:', error);
                    return [2 /*return*/, {
                            connected: false,
                            status: 'disconnected',
                            realConnection: false
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    BaileysWhatsAppService.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.sock) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.sock.logout()];
                    case 2:
                        _a.sent();
                        console.log('🔌 WhatsApp Baileys desconectado');
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Erro ao fechar cliente Baileys:', error_3);
                        return [3 /*break*/, 4];
                    case 4:
                        this.sock = null;
                        this.isConnected = false;
                        this.connectionStatus = 'disconnected';
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    BaileysWhatsAppService.prototype.getConnectionStatus = function () {
        return {
            isConnected: this.isConnected,
            status: this.connectionStatus,
            qrCode: this.qrCodeString,
            realConnection: this.isConnected
        };
    };
    BaileysWhatsAppService.prototype.refreshQRCode = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.connectionStatus !== 'waiting_qr') {
                    return [2 /*return*/, this.qrCodeString];
                }
                try {
                    console.log('🔄 QR Code atual disponível');
                    return [2 /*return*/, this.qrCodeString];
                }
                catch (error) {
                    console.error('❌ Erro ao atualizar QR code:', error);
                    return [2 /*return*/, null];
                }
                return [2 /*return*/];
            });
        });
    };
    BaileysWhatsAppService.prototype.enableRealMode = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🔄 Baileys sempre opera em modo real - reconectando...');
                        if (!this.sock) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.close()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.isConnected = false;
                        this.connectionStatus = 'disconnected';
                        this.qrCodeString = null;
                        console.log('📱 Pronto para conectar - use o endpoint /api/whatsapp/connect');
                        return [2 /*return*/];
                }
            });
        });
    };
    BaileysWhatsAppService.prototype.forceCleanAuth = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🧹 Forçando limpeza da autenticação...');
                        if (!this.sock) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.close()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: 
                    // Clean auth folder
                    return [4 /*yield*/, this.cleanAuthFolder()];
                    case 3:
                        // Clean auth folder
                        _a.sent();
                        // Reset status
                        this.isConnected = false;
                        this.connectionStatus = 'disconnected';
                        this.qrCodeString = null;
                        console.log('✅ Autenticação limpa com sucesso - pronto para nova conexão');
                        return [2 /*return*/];
                }
            });
        });
    };
    // Métodos adicionais do Baileys
    BaileysWhatsAppService.prototype.getProfilePicture = function (jid) {
        return __awaiter(this, void 0, void 0, function () {
            var url, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.sock.profilePictureUrl(jid)];
                    case 1:
                        url = _a.sent();
                        return [2 /*return*/, url];
                    case 2:
                        error_4 = _a.sent();
                        console.error('Erro ao obter foto do perfil:', error_4);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BaileysWhatsAppService.prototype.getStatus = function (jid) {
        return __awaiter(this, void 0, void 0, function () {
            var status_1, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.sock.fetchStatus(jid)];
                    case 1:
                        status_1 = _a.sent();
                        return [2 /*return*/, (status_1 === null || status_1 === void 0 ? void 0 : status_1.status) || null];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Erro ao obter status:', error_5);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BaileysWhatsAppService.prototype.markAsRead = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.sock.readMessages([key])];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        console.error('Erro ao marcar como lida:', error_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BaileysWhatsAppService.prototype.sendTyping = function (jid_1) {
        return __awaiter(this, arguments, void 0, function (jid, typing) {
            var error_7;
            if (typing === void 0) { typing = true; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.sock.sendPresenceUpdate(typing ? 'composing' : 'paused', jid)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        console.error('Erro ao enviar status de digitação:', error_7);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BaileysWhatsAppService.prototype.sendLocation = function (jid, latitude, longitude, name) {
        return __awaiter(this, void 0, void 0, function () {
            var error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.sock.sendMessage(jid, {
                                location: {
                                    degreesLatitude: latitude,
                                    degreesLongitude: longitude,
                                    name: name
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        error_8 = _a.sent();
                        console.error('Erro ao enviar localização:', error_8);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BaileysWhatsAppService.prototype.sendMediaFromUrl = function (jid, url, caption) {
        return __awaiter(this, void 0, void 0, function () {
            var error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.sock.sendMessage(jid, {
                                image: { url: url },
                                caption: caption
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        error_9 = _a.sent();
                        console.error('Erro ao enviar mídia:', error_9);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return BaileysWhatsAppService;
}());
export { BaileysWhatsAppService };
export var baileysWhatsAppService = new BaileysWhatsAppService();
