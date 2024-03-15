import { waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import { notifications } from "../../../../notifications";
import * as genericActions from "../../genericActions";
import { initClientListeners } from "../clientListener";
import { TokenResponse } from "../../../../definitions";
import { sessionDataHandler } from "../../../../sessionDataHandler";
import { Client } from "../../../../__mocks__/@twilio/conversations";
import WebChatLogger from "../../../../logger";

jest.mock("../../../../logger");

describe("Client Listeners", () => {
    const tokenAboutToExpireEvent = "tokenAboutToExpire";
    const connectionStateChangedEvent = "connectionStateChanged";
    const mockDispatch = jest.fn();
    const mockClient = new Client("token");

    beforeAll(() => {
        Object.defineProperty(window, "Twilio", {
            value: {
                getLogger(className: string) {
                    return new WebChatLogger(className);
                }
            }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("updates token on tokenAboutToExpire event", async () => {
        const tokenResponsePayload: TokenResponse = {
            token: "myToken",
            conversation_sid: "myConversationSid",
            identity: "id",
            expiration: "never"
        };
        const updateSessionDataAction = {
            type: "ACTION_UPDATE_SESSION_DATA",
            payload: {
                token: tokenResponsePayload.token,
                conversationSid: tokenResponsePayload.conversation_sid
            }
        };
        jest.spyOn(sessionDataHandler, "getUpdatedToken").mockImplementation(async () => ({
            ...tokenResponsePayload,
            region: ""
        }));

        initClientListeners(mockClient, mockDispatch);
        mockClient.emit(tokenAboutToExpireEvent, 1000);
        const updateTokenSpy = jest.spyOn(mockClient, "updateToken");

        await waitFor(() => {
            expect(updateTokenSpy).toHaveBeenCalledWith(tokenResponsePayload.token);
        });

        expect(mockDispatch).toHaveBeenCalledWith(updateSessionDataAction);
    });

    it("shows notification when disconnected on connectionStateChanged event", async () => {
        const addNotificationSpy = jest.spyOn(genericActions, "addNotification");

        initClientListeners(mockClient, mockDispatch);
        mockClient.emit(connectionStateChangedEvent, "connecting");
        expect(addNotificationSpy).toHaveBeenCalledWith(notifications.noConnectionNotification());
    });

    it("dismisses notification when reconnected on connectionStateChanged event", () => {
        const removeNotificationSpy = jest.spyOn(genericActions, "removeNotification");

        initClientListeners(mockClient, mockDispatch);
        mockClient.emit(connectionStateChangedEvent, "connected");
        expect(removeNotificationSpy).toHaveBeenCalledWith(notifications.noConnectionNotification().id);
    });
});
