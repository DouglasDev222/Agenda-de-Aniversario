export const baileysConfig = {
    // Configurações do logger
    logger: {
        level: 'trace',
        file: './wa-logs.txt'
    },
    // Configurações de conexão
    connection: {
        printQRInTerminal: false,
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: true,
        syncFullHistory: false
    },
    // Configurações de autenticação
    auth: {
        folder: 'baileys_auth_info'
    },
    // Configurações de mensagem
    message: {
        retryDelay: 3000,
        maxRetries: 3
    },
    // Configurações específicas para o Brasil
    brazil: {
        countryCode: '55',
        defaultDDD: '11' // São Paulo como padrão
    }
};
export default baileysConfig;
