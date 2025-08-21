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
import { baileysWhatsAppService } from './baileys-whatsapp';
import { WhatsAppBusinessAPIService } from './whatsapp-business-api.js';
var WhatsAppService = /** @class */ (function () {
    function WhatsAppService() {
        this.simulateMode = false;
        this.businessAPI = new WhatsAppBusinessAPIService();
    }
    WhatsAppService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🚀 Inicializando WhatsApp Service com Baileys...');
                        // Check if Business API is configured first
                        if (this.businessAPI.isConfigured()) {
                            console.log('✅ WhatsApp Business API configurada - usando API oficial');
                            return [2 /*return*/];
                        }
                        if (this.simulateMode) {
                            console.log('✅ WhatsApp Service initialized in simulation mode');
                            return [2 /*return*/];
                        }
                        // Initialize Baileys
                        return [4 /*yield*/, baileysWhatsAppService.initialize()];
                    case 1:
                        // Initialize Baileys
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    WhatsAppService.prototype.sendMessage = function (phoneNumber, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83C\uDFAF ENVIO DE MENSAGEM INICIADO:");
                        console.log("\uD83D\uDCDE N\u00FAmero de destino: ".concat(phoneNumber));
                        console.log("\uD83D\uDCAC Mensagem: ".concat(message.substring(0, 100), "..."));
                        if (!(this.businessAPI && this.businessAPI.isConfigured())) return [3 /*break*/, 2];
                        console.log("\uD83D\uDD04 Usando WhatsApp Business API para envio");
                        return [4 /*yield*/, this.businessAPI.sendMessage(phoneNumber, message)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        if (this.simulateMode) {
                            console.log("\uD83D\uDCF1 MODO SIMULA\u00C7\u00C3O - Enviando para ".concat(phoneNumber, ":"));
                            console.log("\uD83D\uDCAC ".concat(message));
                            console.log('✅ Mensagem "enviada" com sucesso (modo simulação)');
                            return [2 /*return*/, true];
                        }
                        return [4 /*yield*/, baileysWhatsAppService.sendMessage(phoneNumber, message)];
                    case 3: 
                    // Use Baileys
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WhatsAppService.prototype.testConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var isConfigured, baileysStatus;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Business API check
                        if (this.businessAPI && this.businessAPI.isConfigured()) {
                            console.log('🔍 Testando conexão WhatsApp Business API');
                            isConfigured = this.businessAPI.isConfigured();
                            return [2 /*return*/, {
                                    connected: isConfigured,
                                    status: isConfigured ? 'connected' : 'disconnected',
                                    simulateMode: false,
                                    realConnection: isConfigured
                                }];
                        }
                        // Simulation mode check
                        if (this.simulateMode) {
                            console.log('🔍 Testando conexão WhatsApp (modo simulação)');
                            return [2 /*return*/, {
                                    connected: true,
                                    status: 'connected',
                                    simulateMode: true,
                                    realConnection: false
                                }];
                        }
                        return [4 /*yield*/, baileysWhatsAppService.testConnection()];
                    case 1:
                        baileysStatus = _a.sent();
                        return [2 /*return*/, {
                                connected: baileysStatus.connected,
                                status: baileysStatus.status,
                                simulateMode: false,
                                realConnection: baileysStatus.realConnection
                            }];
                }
            });
        });
    };
    WhatsAppService.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, baileysWhatsAppService.close()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    WhatsAppService.prototype.getConnectionStatus = function () {
        // Business API status
        if (this.businessAPI && this.businessAPI.isConfigured()) {
            return {
                isConnected: true,
                status: 'connected',
                qrCode: null,
                simulateMode: false,
                realConnection: true
            };
        }
        // Simulation mode status
        if (this.simulateMode) {
            return {
                isConnected: true,
                status: 'connected',
                qrCode: null,
                simulateMode: true,
                realConnection: false
            };
        }
        // Baileys status
        return baileysWhatsAppService.getConnectionStatus();
    };
    WhatsAppService.prototype.refreshQRCode = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.simulateMode) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, baileysWhatsAppService.refreshQRCode()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WhatsAppService.prototype.enableSimulationMode = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.simulateMode = true;
                        return [4 /*yield*/, baileysWhatsAppService.close()];
                    case 1:
                        _a.sent();
                        console.log('✅ Modo simulação ativado');
                        return [2 /*return*/];
                }
            });
        });
    };
    WhatsAppService.prototype.enableRealMode = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🔄 Desabilitando modo simulação - preparando conexão real com Baileys');
                        this.simulateMode = false;
                        return [4 /*yield*/, baileysWhatsAppService.enableRealMode()];
                    case 1:
                        _a.sent();
                        console.log('📱 Modo real ativado - use o endpoint /api/whatsapp/connect para conectar');
                        return [2 /*return*/];
                }
            });
        });
    };
    WhatsAppService.prototype.forceCleanAuth = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🧹 Forçando limpeza da autenticação WhatsApp...');
                        if (this.simulateMode) {
                            console.log('⚠️ Modo simulação ativado - nenhuma limpeza necessária');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, baileysWhatsAppService.forceCleanAuth()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Additional Baileys methods
    WhatsAppService.prototype.getProfilePicture = function (phoneNumber) {
        return __awaiter(this, void 0, void 0, function () {
            var formattedNumber, jid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.simulateMode)
                            return [2 /*return*/, null];
                        formattedNumber = phoneNumber.replace(/\D/g, '');
                        if (!formattedNumber.startsWith('55')) {
                            formattedNumber = '55' + formattedNumber;
                        }
                        jid = formattedNumber + '@s.whatsapp.net';
                        return [4 /*yield*/, baileysWhatsAppService.getProfilePicture(jid)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WhatsAppService.prototype.getStatus = function (phoneNumber) {
        return __awaiter(this, void 0, void 0, function () {
            var formattedNumber, jid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.simulateMode)
                            return [2 /*return*/, null];
                        formattedNumber = phoneNumber.replace(/\D/g, '');
                        if (!formattedNumber.startsWith('55')) {
                            formattedNumber = '55' + formattedNumber;
                        }
                        jid = formattedNumber + '@s.whatsapp.net';
                        return [4 /*yield*/, baileysWhatsAppService.getStatus(jid)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WhatsAppService.prototype.sendMediaFromUrl = function (phoneNumber, url, caption) {
        return __awaiter(this, void 0, void 0, function () {
            var formattedNumber, jid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.simulateMode) {
                            console.log("\uD83D\uDCF1 MODO SIMULA\u00C7\u00C3O - Enviando m\u00EDdia para ".concat(phoneNumber, ": ").concat(url));
                            return [2 /*return*/, true];
                        }
                        formattedNumber = phoneNumber.replace(/\D/g, '');
                        if (!formattedNumber.startsWith('55')) {
                            formattedNumber = '55' + formattedNumber;
                        }
                        jid = formattedNumber + '@s.whatsapp.net';
                        return [4 /*yield*/, baileysWhatsAppService.sendMediaFromUrl(jid, url, caption)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    WhatsAppService.prototype.sendLocation = function (phoneNumber, latitude, longitude, name) {
        return __awaiter(this, void 0, void 0, function () {
            var formattedNumber, jid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.simulateMode) {
                            console.log("\uD83D\uDCF1 MODO SIMULA\u00C7\u00C3O - Enviando localiza\u00E7\u00E3o para ".concat(phoneNumber, ": ").concat(latitude, ", ").concat(longitude));
                            return [2 /*return*/, true];
                        }
                        formattedNumber = phoneNumber.replace(/\D/g, '');
                        if (!formattedNumber.startsWith('55')) {
                            formattedNumber = '55' + formattedNumber;
                        }
                        jid = formattedNumber + '@s.whatsapp.net';
                        return [4 /*yield*/, baileysWhatsAppService.sendLocation(jid, latitude, longitude, name)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return WhatsAppService;
}());
export { WhatsAppService };
export var whatsappService = new WhatsAppService();
