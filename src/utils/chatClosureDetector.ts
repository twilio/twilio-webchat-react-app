import { Conversation, Participant } from "@twilio/conversations";

export interface ChatClosureEvent {
    type: 'conversation_closed' | 'agent_left' | 'conversation_inactive';
    timestamp: Date;
    agentIdentity?: string;
    reason?: string;
}

export type ChatClosureCallback = (event: ChatClosureEvent) => void;

/**
 * Utility to detect when a chat is closed by an agent
 */
export class ChatClosureDetector {
    private conversation: Conversation;
    private callbacks: ChatClosureCallback[] = [];
    private isListening = false;

    constructor(conversation: Conversation) {
        this.conversation = conversation;
    }

    /**
     * Add a callback to be notified when the chat is closed
     */
    onChatClosed(callback: ChatClosureCallback): void {
        this.callbacks.push(callback);
    }

    /**
     * Remove a callback
     */
    offChatClosed(callback: ChatClosureCallback): void {
        const index = this.callbacks.indexOf(callback);
        if (index > -1) {
            this.callbacks.splice(index, 1);
        }
    }

    /**
     * Start listening for chat closure events
     */
    startListening(): void {
        if (this.isListening) return;
        
        this.isListening = true;

        // Listen for conversation state changes
        this.conversation.addListener("updated", ({ conversation: updatedConversation, updateReasons }) => {
            if (updateReasons?.includes("state")) {
                const newState = updatedConversation?.state?.current;
                
                if (newState === "closed") {
                    this.triggerCallbacks({
                        type: 'conversation_closed',
                        timestamp: new Date(),
                        reason: 'Conversation was closed by agent'
                    });
                } else if (newState === "inactive") {
                    this.triggerCallbacks({
                        type: 'conversation_inactive',
                        timestamp: new Date(),
                        reason: 'Conversation became inactive'
                    });
                }
            }
        });

        // Listen for agent leaving
        this.conversation.addListener("participantLeft", async (participant: Participant) => {
            try {
                const user = await participant.getUser();
                const isAgent = user.identity !== (this.conversation as { localParticipant?: { identity?: string } }).localParticipant?.identity;
                
                if (isAgent) {
                    this.triggerCallbacks({
                        type: 'agent_left',
                        timestamp: new Date(),
                        agentIdentity: user.identity,
                        reason: 'Agent left the conversation'
                    });
                }
            } catch (error) {
                console.error('Error detecting agent leaving:', error);
            }
        });
    }

    /**
     * Stop listening for chat closure events
     */
    stopListening(): void {
        if (!this.isListening) return;
        
        this.isListening = false;
        this.conversation.removeAllListeners();
    }

    /**
     * Check if the conversation is currently closed
     */
    isChatClosed(): boolean {
        const state = this.conversation.state?.current;
        return state === "closed" || state === "inactive";
    }

    /**
     * Get the current conversation state
     */
    getConversationState(): string | undefined {
        return this.conversation.state?.current;
    }

    private triggerCallbacks(event: ChatClosureEvent): void {
        this.callbacks.forEach(callback => {
            try {
                callback(event);
            } catch (error) {
                console.error('Error in chat closure callback:', error);
            }
        });
    }
}
