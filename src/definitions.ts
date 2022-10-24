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
    emailSubject?: (agentNames: (string | undefined)[]) => string;
    emailContent?: (customerName: string | undefined, transcript: string) => string;
};
