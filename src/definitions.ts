export type Token = {
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

export type TranscriptConfig = {
    downloadEnabled?: boolean;
    emailEnabled?: boolean;
    emailContent?: (customerName: string | undefined, transcript: string) => string;
};
