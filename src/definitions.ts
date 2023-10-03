import { GenericThemeShape } from "@twilio-paste/theme";

export type Token = {
    token: string;
    conversationSid: string;
    // eslint-disable-next-line camelcase
    conversation_sid: string;
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

export type InitialConfig = {
    deploymentKey: string;
    region?: string;
    theme?: {
        isLight?: boolean;
        overrides?: Partial<GenericThemeShape>;
    };
};
