/* eslint-disable @typescript-eslint/no-unused-vars */

import type {
    Message,
    MessageBuilder,
    NotificationLevel,
    Participant,
    ParticipantBindingOptions,
    SendEmailOptions,
    SendMediaOptions,
    Conversation as ConversationType
} from "@twilio/conversations";

import { MockedPaginator } from "../../../test-utils";

const { Conversation: OriginalConversation } =
    jest.requireActual<{ Conversation: typeof ConversationType }>("@twilio/conversations");

export class Conversation extends OriginalConversation {
    /**
     * Add a participant to the conversation by its identity.
     * @param identity Identity of the Client to add.
     * @param attributes Attributes to be attached to the participant.
     */
    async add(identity: string, attributes?: Record<string, unknown>): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Add a non-chat participant to the conversation.
     * @param proxyAddress Proxy (Twilio) address of the participant.
     * @param address User address of the participant.
     * @param attributes Attributes to be attached to the participant.
     * @param bindingOptions Options for adding email participants - name and CC/To level.
     */
    async addNonChatParticipant(
        proxyAddress: string,
        address: string,
        attributes?: Record<string, unknown>,
        bindingOptions?: ParticipantBindingOptions
    ): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Advance the conversation's last read message index to the current read horizon.
     * Rejects if the user is not a participant of the conversation.
     * Last read message index is updated only if the new index value is higher than the previous.
     * @param index Message index to advance to.
     * @return Resulting unread messages count in the conversation.
     */
    async advanceLastReadMessageIndex(index: number): Promise<number> {
        return Promise.resolve(42);
    }

    /**
     * Delete the conversation and unsubscribe from its events.
     */
    async delete(): Promise<Conversation> {
        return this as unknown as Conversation;
    }

    /**
     * Get the custom attributes of this Conversation.
     */
    async getAttributes(): Promise<Record<string, unknown>> {
        return Promise.resolve({});
    }

    /**
     * Returns messages from the conversation using the paginator interface.
     * @param pageSize Number of messages to return in a single chunk. Default is 30.
     * @param anchor Index of the newest message to fetch. Default is from the end.
     * @param direction Query direction. By default it queries backwards
     * from newer to older. The `"forward"` value will query in the opposite direction.
     * @return A page of messages.
     */
    async getMessages(
        pageSize?: number,
        anchor?: number,
        direction?: "backwards" | "forward"
    ): Promise<MockedPaginator<Message>> {
        return Promise.resolve(new MockedPaginator());
    }

    /**
     * Get a list of all the participants who are joined to this conversation.
     */
    async getParticipants(): Promise<Participant[]> {
        return Promise.resolve([]);
    }

    /**
     * Get conversation participants count.
     *
     * This method is semi-realtime. This means that this data will be eventually correct,
     * but will also be possibly incorrect for a few seconds. The Conversations system does not
     * provide real time events for counter values changes.
     *
     * This is useful for any UI badges, but it is not recommended to build any core application
     * logic based on these counters being accurate in real time.
     */
    async getParticipantsCount(): Promise<number> {
        return (await this.getParticipants()).length;
    }

    /**
     * Get a participant by its SID.
     * @param participantSid Participant SID.
     */
    async getParticipantBySid(participantSid: string): Promise<Participant> {
        return Promise.resolve({} as Participant);
    }

    /**
     * Get a participant by its identity.
     * @param identity Participant identity.
     */
    async getParticipantByIdentity(identity: string): Promise<Participant> {
        return Promise.resolve({} as Participant);
    }

    /**
     * Get the total message count in the conversation.
     *
     * This method is semi-realtime. This means that this data will be eventually correct,
     * but will also be possibly incorrect for a few seconds. The Conversations system does not
     * provide real time events for counter values changes.
     *
     * This is useful for any UI badges, but it is not recommended to build any core application
     * logic based on these counters being accurate in real time.
     */
    async getMessagesCount(): Promise<number> {
        return 0;
    }

    /**
     * Get unread messages count for the user if they are a participant of this conversation.
     * Rejects if the user is not a participant of the conversation.
     *
     * Use this method to obtain the number of unread messages together with
     * {@link Conversation.updateLastReadMessageIndex} instead of relying on the
     * message indices which may have gaps. See {@link Message.index} for details.
     *
     * This method is semi-realtime. This means that this data will be eventually correct,
     * but will also be possibly incorrect for a few seconds. The Conversations system does not
     * provide real time events for counter values changes.
     *
     * This is useful for any UI badges, but it is not recommended to build any core application
     * logic based on these counters being accurate in real time.
     */
    async getUnreadMessagesCount(): Promise<number | null> {
        return Promise.resolve(0);
    }

    /**
     * Join the conversation and subscribe to its events.
     */
    async join(): Promise<Conversation> {
        return this;
    }

    /**
     * Leave the conversation.
     */
    async leave(): Promise<Conversation> {
        return this;
    }

    /**
     * Remove a participant from the conversation. When a string is passed as the
     * argument, it will assume that the string is an identity or SID.
     * @param participant Identity, SID or the participant object to remove.
     */
    async removeParticipant(participant: string | Participant): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Send a message to the conversation.
     * @param message Message body for the text message,
     * `FormData` or {@link SendMediaOptions} for media content. Sending FormData is supported only with the browser engine.
     * @param messageAttributes Attributes for the message.
     * @param emailOptions Email options for the message.
     * @return Index of the new message.
     */
    async sendMessage(
        message: string | FormData | SendMediaOptions | null,
        messageAttributes?: Record<string, unknown>,
        emailOptions?: SendEmailOptions
    ): Promise<number> {
        return Promise.resolve(1);
    }

    /**
     * New interface to prepare for sending a message.
     * Use instead of `sendMessage`.
     * @return A MessageBuilder to help set all message sending options.
     */
    prepareMessage(): MessageBuilder {
        return {} as MessageBuilder;
    }

    /**
     * Set last read message index of the conversation to the index of the last known message.
     * @return Resulting unread messages count in the conversation.
     */
    async setAllMessagesRead(): Promise<number> {
        return Promise.resolve(0);
    }

    /**
     * Set all messages in the conversation unread.
     * @return Resulting unread messages count in the conversation.
     */
    async setAllMessagesUnread(): Promise<number> {
        return Promise.resolve(0);
    }

    /**
     * Set user notification level for this conversation.
     * @param notificationLevel New user notification level.
     */
    async setUserNotificationLevel(notificationLevel: NotificationLevel): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Send a notification to the server indicating that this client is currently typing in this conversation.
     * Typing ended notification is sent after a while automatically, but by calling this method again you ensure that typing ended is not received.
     */
    async typing(): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Update the attributes of the conversation.
     * @param attributes New attributes.
     */
    async updateAttributes(attributes: Record<string, unknown>): Promise<Conversation> {
        return this;
    }

    /**
     * Update the friendly name of the conversation.
     * @param friendlyName New friendly name.
     */
    async updateFriendlyName(friendlyName: string): Promise<Conversation> {
        return this;
    }

    /**
     * Set the last read message index to the current read horizon.
     * @param index Message index to set as last read.
     * If null is provided, then the behavior is identical to {@link Conversation.setAllMessagesUnread}.
     * @returns Resulting unread messages count in the conversation.
     */
    async updateLastReadMessageIndex(index: number | null): Promise<number> {
        return Promise.resolve(0);
    }

    /**
     * Update the unique name of the conversation.
     * @param uniqueName New unique name for the conversation. Setting unique name to null removes it.
     */
    async updateUniqueName(uniqueName: string | null): Promise<Conversation> {
        return this;
    }

    /**
     * Load and subscribe to this conversation and do not subscribe to its participants and messages.
     * This or _subscribeStreams will need to be called before any events on conversation will fire.
     * @internal
     */
    async _subscribe(): Promise<unknown> {
        return Promise.resolve({});
    }

    /**
     * Load the attributes of this conversation and instantiate its participants and messages.
     * This or _subscribe will need to be called before any events on the conversation will fire.
     * This will need to be called before any events on participants or messages will fire
     * @internal
     */
    async _subscribeStreams(): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Stop listening for and firing events on this conversation.
     * @internal
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async _unsubscribe(): Promise<[void, any]> {
        return Promise.resolve([, undefined]);
    }
}
