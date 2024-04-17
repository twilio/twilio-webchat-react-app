import { I18n, I18nContextType } from "./i18n.interface";

export const defaultI18nEsMX: I18n = {
    engagementFormTitle: "Hola",
    engagementFormTitleIcon: ` 👋`,
    engagementFormSubTitle: "¿Cómo podemos ayudarte?",
    engagementFormButtonSend: "Enviar",
    engagementFormLabelInputMessage: "Envíanos un mensaje",
    messagingInput: "Escribe un mensaje...",
    messagingChatStarted: "Chat iniciado",
    messagingIsTyping: "Está escribiendo...",
    messagingRead: "Leído",
    messagingAreNotSupport: "Los mensajes multimedia no son compatibles",
    messagingSeparatorNew: "Nuevo",
    messagingSeparatorToday: "Hoy",
    messagingSeparatorYesterday: "Ayer",
    messagingDropFileOrImage: "Arrastra un archivo o imagen aquí",
    notificationFileAttachmentAlreadyAttached: "El archivo ya está adjunto.",
    notificationFileAttachmentSizeExceeded:
        "no se puede adjuntar porque el archivo es demasiado grande. El tamaño máximo de archivo es",
    notificationFileAttachmentTypeNotSupported:
        "no se puede adjuntar porque ese tipo de archivo no es compatible. Por favor, intente con un archivo diferente.",
    notificationFileDownloadSizeExceeded:
        "no se puede descargar porque el archivo es demasiado grande. El tamaño máximo de archivo es",
    notificationFileDownloadTypeNotSupported: "no se puede descargar porque ese tipo de archivo no es compatible.",
    notificationNoConnection: "Conexión perdida. Intentando reconectar.",
    notificationSomethingWentWrong: "Algo salió mal.",
    notificationPleaseTryAgain: "Por favor, inténtalo de nuevo.",
    notificationFailedToInitSession: "No se pudo cargar la conversación."
};

const defaultI18nPtBr: I18n = {
    engagementFormTitle: "Olá",
    engagementFormTitleIcon: ` `,
    engagementFormSubTitle: "Como podemos te ajudar?",
    engagementFormButtonSend: "Enviar",
    engagementFormLabelInputMessage: "Envie uma mensagem",
    messagingInput: "Escreva uma mensagem...",
    messagingChatStarted: "Chat iniciado",
    messagingIsTyping: "Está escrevendo...",
    messagingRead: "Lido",
    messagingAreNotSupport: "Mensagens de mídia não são suportadas",
    messagingSeparatorNew: "Novo",
    messagingSeparatorToday: "Hoje",
    messagingSeparatorYesterday: "Ontem",
    messagingDropFileOrImage: "Arraste um arquivo ou imagem aqui",
    notificationFileAttachmentAlreadyAttached: "O arquivo já está anexado.",
    notificationFileAttachmentSizeExceeded:
        "não pode ser anexado porque o arquivo é muito grande. O tamanho máximo do arquivo é",
    notificationFileAttachmentTypeNotSupported:
        "não pode ser anexado porque esse tipo de arquivo não é suportado. Por favor, tente com um arquivo diferente.",
    notificationFileDownloadSizeExceeded:
        "não pode ser baixado porque o arquivo é muito grande. O tamanho máximo do arquivo é",
    notificationFileDownloadTypeNotSupported: "não pode ser baixado porque esse tipo de arquivo não é suportado.",
    notificationNoConnection: "Conexão perdida. Tentando reconectar.",
    notificationSomethingWentWrong: "Algo deu errado.",
    notificationPleaseTryAgain: "Por favor, tente novamente.",
    notificationFailedToInitSession: "Não foi possível carregar a conversa."
};

export const i18n: I18nContextType["i18n"] = {
    LUUNA: {
        "es-MX": defaultI18nEsMX,
        "pt-BR": defaultI18nPtBr
    },
    "Luuna Brasil": {
        "es-MX": defaultI18nEsMX,
        "pt-BR": defaultI18nPtBr
    },
    MAPPA: {
        "es-MX": defaultI18nEsMX,
        "pt-BR": defaultI18nPtBr
    },
    NOOZ: {
        "es-MX": defaultI18nEsMX,
        "pt-BR": defaultI18nPtBr
    }
};
