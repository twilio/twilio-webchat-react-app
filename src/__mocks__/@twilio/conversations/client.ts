import type { ClientOptions, Client as ClientType, ConnectionState, User as UserType } from "@twilio/conversations";

import { Conversation } from "./conversation";
import { MockedPaginator } from "../../../test-utils";

const { Client: ConversationClient, User } =
    jest.requireActual<{ Client: typeof ClientType; User: typeof UserType }>("@twilio/conversations");

export class Client extends ConversationClient {
    /**
     * Client connection state.
     */
    connectionState: ConnectionState = "connected";

    /**
     * Information of the logged-in user. Before client initialization, returns an
     * uninitialized user. Will trigger a {@link Client.userUpdated} event after
     * initialization.
     */
    get user() {
        return new User("identity", "entityName", null, {
            syncClient: {},
            commandExecutor: {}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
    }

    /**
     * Client reachability state. Throws if accessed before the client
     * initialization was completed.
     */
    get reachabilityEnabled(): boolean {
        return true;
    }

    get token(): string {
        return this.token;
    }

    /**
     * @deprecated Call constructor directly.
     *
     * Factory method to create a Conversations client instance.
     *
     * The factory method will automatically trigger connection.
     * Do not use it if you need finer-grained control.
     *
     * Since this method returns an already-initialized client, some of the events
     * will be lost because they happen *before* the initialization. It is
     * recommended that `client.onWithReplay` is used as opposed to `client.on`
     * for subscribing to client events. The `client.onWithReplay` will re-emit
     * the most recent value for a given event if it emitted before the
     * subscription.
     *
     * @param token Access token.
     * @param options Options to customize the client.
     * @returns Returns a fully initialized client.
     */
    static async create(token: string, options?: ClientOptions): Promise<Client> {
        return Promise.resolve(new Client(token, options));
    }

    /**
     * Gracefully shut down the client.
     */
    async shutdown(): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Update the token used by the client and re-register with the Conversations services.
     * @param token New access token.
     */
    async updateToken(): Promise<Client> {
        return this;
    }

    /**
     * Get a known conversation by its SID.
     * @param conversationSid Conversation sid
     */
    async getConversationBySid(conversationSid: string): Promise<Conversation> {
        return new Conversation(
            {
                channel: "chat",
                entityName: "",
                uniqueName: "",
                attributes: {},
                lastConsumedMessageIndex: 0,
                dateCreated: new Date(),
                dateUpdated: new Date()
            },
            conversationSid,
            {
                self: "",
                messages: "",
                participants: ""
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {} as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {} as any
        );
    }

    /**
     * Get a known conversation by its unique identifier name.
     * @param uniqueName The unique identifier name of the conversation.
     */
    async getConversationByUniqueName(): Promise<Conversation> {
        return new Conversation(
            {
                channel: "chat",
                entityName: "",
                uniqueName: "",
                attributes: {},
                lastConsumedMessageIndex: 0,
                dateCreated: new Date(),
                dateUpdated: new Date()
            },
            "sid",
            {
                self: "",
                messages: "",
                participants: ""
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {} as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {} as any
        );
    }

    /**
     * Get the current list of all the subscribed conversations.
     */
    async getSubscribedConversations(): Promise<MockedPaginator<Conversation>> {
        return new MockedPaginator();
    }

    /**
     * Register for push notifications.
     * @param channelType Channel type.
     * @param registrationId Push notification ID provided by the FCM/APNS service on the platform.
     */
    async setPushRegistrationId(): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Unregister from push notifications.
     * @param channelType Channel type.
     * @deprecated Use removePushRegistrations() instead.
     */
    async unsetPushRegistrationId(): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Clear existing registrations directly using provided device token.
     * This is useful to ensure stopped subscriptions without resubscribing.
     *
     * This function goes completely beside the state machine and removes all registrations.
     * Use with caution: if it races with current state machine operations, madness will ensue.
     *
     * @param channelType Channel type.
     * @param registrationId Push notification ID provided by the FCM/APNS service on the platform.
     */
    async removePushRegistrations(): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Handle push notification payload parsing and emit the {@link Client.pushNotification} event on this {@link Client} instance.
     * @param notificationPayload Push notification payload
     */
    async handlePushNotification(): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Gets a user with the given identity. If it's in the subscribed list, then return the user object from it;
     * if not, then subscribe and add user to the subscribed list.
     * @param identity Identity of the user.
     * @returns A fully initialized user.
     */
    async getUser() {
        return this.user;
    }

    /**
     * Get a list of subscribed user objects.
     */
    async getSubscribedUsers() {
        return [];
    }
}
