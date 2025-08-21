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
import fetch from 'node-fetch';
var WhatsAppBusinessAPIService = /** @class */ (function () {
    function WhatsAppBusinessAPIService() {
        this.baseUrl = 'https://graph.facebook.com/v18.0';
        this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
        this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    }
    WhatsAppBusinessAPIService.prototype.sendMessage = function (to, message) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response, error, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.accessToken || !this.phoneNumberId) {
                            console.log('📱 WhatsApp Business API não configurado - usando modo simulação');
                            console.log("\uD83D\uDCAC Simulando envio para ".concat(to, ": ").concat(message));
                            return [2 /*return*/, true];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        url = "".concat(this.baseUrl, "/").concat(this.phoneNumberId, "/messages");
                        return [4 /*yield*/, fetch(url, {
                                method: 'POST',
                                headers: {
                                    'Authorization': "Bearer ".concat(this.accessToken),
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    messaging_product: 'whatsapp',
                                    to: to.replace(/\D/g, ''), // Remove apenas formatação, mantém código do país
                                    type: 'text',
                                    text: {
                                        body: message
                                    }
                                })
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) return [3 /*break*/, 3];
                        console.log("\u2705 Mensagem enviada via WhatsApp Business API para ".concat(to));
                        return [2 /*return*/, true];
                    case 3: return [4 /*yield*/, response.text()];
                    case 4:
                        error = _a.sent();
                        console.error('❌ Erro na WhatsApp Business API:', error);
                        return [2 /*return*/, false];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        console.error('❌ Erro ao enviar mensagem via Business API:', error_1);
                        return [2 /*return*/, false];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    WhatsAppBusinessAPIService.prototype.isConfigured = function () {
        return !!(this.accessToken && this.phoneNumberId);
    };
    return WhatsAppBusinessAPIService;
}());
export { WhatsAppBusinessAPIService };
