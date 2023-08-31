export type TokenResponse = {
    token: string;
    conversationSid: string;
    identity: string;
    expiration: string;
};

export type SessionInformation = TokenResponse & {
    region: string;
};

export type FileAttachmentConfig = {
    enabled?: boolean;
    maxFileSize?: number;
    acceptedExtensions?: string[];
};
