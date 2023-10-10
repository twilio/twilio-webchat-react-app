export type TokenResponse = {
    token: string;
    conversationSid: string;
    conversation_sid: string;
    identity: string;
    expiration: string;
};

export type FileAttachmentConfig = {
    enabled?: boolean;
    maxFileSize?: number;
    acceptedExtensions?: string[];
};
