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

export interface ParticipantResponse {
  account_sid: string;
  chat_service_sid: string;
  conversation_sid: string;
  role_sid: string;
  sid: string;
  attributes: string;
  date_created: string;
  date_updated: string;
  identity: string;
  messaging_binding: {
      type: "chat" | "sms" | "whatsapp" | "email";
      address: string;
      proxy_address: string;
  } | null;
  url: string;
  links: {
      conversation: string;
  };
}
