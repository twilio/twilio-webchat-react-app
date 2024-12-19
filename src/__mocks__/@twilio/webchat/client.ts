import type { ClientOptions, WebChatClient as ClientType, ConnectionState } from "@twilio/webchat";

import { Conversation } from "./conversation";
import { MockedPaginator } from "../../../test-utils";

const { Client: WebChatClient } = jest.requireActual<{ Client: typeof ClientType }>("@twilio/webchat");

export class Client extends WebChatClient {
    /**
     * Client connection state.
     */
    connectionState: ConnectionState = "connected";

    /**
     * Update the token used by the client and re-register with the Conversations services.
     * @param token New access token.
     */
    async updateToken(): Promise<Client> {
        return this;
    }
}
