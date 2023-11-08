export type TokenResponse = {
    token: string;
    conversation_sid: string;
    identity: string;
    expiration: string;
};

export type ProcesssedTokenResponse = {
    token: string;
    conversationSid: string;
    identity: string;
    expiration: string;
};

export type FileAttachmentConfig = {
    enabled?: boolean;
    maxFileSize?: number;
    acceptedExtensions?: string[];
};
