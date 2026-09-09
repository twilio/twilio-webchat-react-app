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

// Plain-data shape returned by the /getTranscript backend route, used to rebuild the "chat
// ended" screen when a customer's own identity-scoped SDK access to a closed conversation has
// been revoked (see initActions.ts). Deliberately not the real @twilio/conversations SDK
// classes - those have private members a plain object can never satisfy, and this data only
// ever needs to be read, never acted on live.
export type ClosedConversationMedia = {
    sid: string;
    filename: string;
    contentType: string;
    size: number;
    // Pre-fetched server-side (the server has account-level access even after the
    // conversation closes) so the client never needs to call the SDK's own
    // getContentTemporaryUrl() - see initActions.ts for how this gets wrapped to match it.
    temporaryUrl: string | null;
};

export type ClosedConversationMessage = {
    sid: string;
    index: number;
    author: string;
    body: string;
    dateCreated: string;
    dateUpdated: string;
    participantSid: string | null;
    type: "text" | "media";
    attachedMedia: ClosedConversationMedia[] | null;
};

export type ClosedConversationParticipant = {
    sid: string;
    identity: string;
    lastReadMessageIndex: number | null;
    isTyping: boolean;
};

export type ClosedConversationUser = {
    identity: string;
    friendlyName: string;
};

export type ClosedConversationTranscript = {
    conversationState: string;
    conversationDateCreated: string;
    messages: ClosedConversationMessage[];
    participants: ClosedConversationParticipant[];
    users: ClosedConversationUser[];
};
