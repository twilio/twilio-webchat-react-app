import { Client, Message, Conversation } from "@twilio/conversations";
import { applyMiddleware, combineReducers, createStore, compose } from "redux";
import thunk from "redux-thunk";

import { MockedPaginator } from "../../../test-utils";
import { initConfig, initSession } from "../initActions";
import { initClientListeners } from "../listeners/clientListener";
import { initConversationListener } from "../listeners/conversationListener";
import { EngagementPhase } from "../../definitions";
import {
    ACTION_ADD_NOTIFICATION,
    ACTION_CHANGE_ENGAGEMENT_PHASE,
    ACTION_LOAD_CONFIG,
    ACTION_START_SESSION
} from "../actionTypes";
import { initMessagesListener } from "../listeners/messagesListener";
import { initParticipantsListener } from "../listeners/participantsListener";
import { SessionReducer } from "../../session.reducer";
import { notifications } from "../../../notifications";

jest.mock("@twilio/conversations");
jest.mock("../listeners/clientListener", () => ({
    initClientListeners: jest.fn()
}));
jest.mock("../listeners/conversationListener", () => ({
    initConversationListener: jest.fn()
}));
jest.mock("../listeners/messagesListener", () => ({
    initMessagesListener: jest.fn()
}));
jest.mock("../listeners/participantsListener", () => ({
    initParticipantsListener: jest.fn()
}));

const createSessionStore = () =>
    createStore(
        combineReducers({
            session: SessionReducer
        }),
        compose(applyMiddleware(thunk))
    );

describe("Actions", () => {
    const token = "token";
    const conversationSid = "sid";
    const messages = [{ sid: "sid1" }, { sid: "sid2" }] as Message[];
    const users = [{ idenity: "id" }];
    const participants = [{ getUser: () => users[0] }];
    const conversation = {
        state: { current: "active" },
        getParticipants: () => participants,
        getMessages: () => new MockedPaginator(messages)
    } as unknown as Conversation;
    const conversationsClient = {
        getConversationBySid: () => conversation
    } as unknown as Client;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockStore: any;

    beforeEach(() => {
        mockStore = createSessionStore();
    });

    describe("initSession", () => {
        it("dispatches start session action with fetched state as payload", async () => {
            jest.spyOn(Client, "create").mockResolvedValueOnce(conversationsClient);
            const mockDispatch = jest.fn();

            await initSession({ token, conversationSid })(mockDispatch);

            expect(mockDispatch).toHaveBeenCalled();
            const dispatchArgs = mockDispatch.mock.calls[0][0];
            expect(dispatchArgs).toMatchObject({
                type: ACTION_START_SESSION,
                payload: {
                    token,
                    conversationSid,
                    conversationsClient,
                    conversation,
                    users,
                    participants,
                    messages,
                    conversationState: conversation.state?.current,
                    currentPhase: EngagementPhase.MessagingCanvas
                }
            });
        });

        it("initializes listeners", async () => {
            jest.spyOn(Client, "create").mockResolvedValueOnce(conversationsClient);

            await mockStore.dispatch(initSession({ token, conversationSid }));

            expect(initClientListeners).toHaveBeenCalledWith(conversationsClient, expect.any(Function));
            expect(initConversationListener).toHaveBeenCalledWith(conversation, expect.any(Function));
            expect(initMessagesListener).toHaveBeenCalledWith(conversation, expect.any(Function));
            expect(initParticipantsListener).toHaveBeenCalledWith(conversation, expect.any(Function));
        });

        it("revert back to preEngagementForm with an error notification if it fails to initialize session", async () => {
            jest.spyOn(Client, "create").mockResolvedValueOnce({} as Client);
            const innerDispatchSpy = jest.fn();
            jest.spyOn(mockStore, "dispatch").mockImplementation((callback: any) => callback(innerDispatchSpy));
            await mockStore.dispatch(initSession({ token, conversationSid }));

            expect(innerDispatchSpy).toHaveBeenCalledWith({
                payload: {
                    notification: notifications.failedToInitSessionNotification("Couldn't load conversation")
                },
                type: ACTION_ADD_NOTIFICATION
            });
            expect(innerDispatchSpy).toHaveBeenCalledWith({
                payload: { currentPhase: "PreEngagementForm" },
                type: ACTION_CHANGE_ENGAGEMENT_PHASE
            });
            jest.spyOn(mockStore, "dispatch").mockRestore();
        });
    });

    describe("initConfig", () => {
        it("returns init config action", () => {
            expect(initConfig({})).toEqual({
                type: ACTION_LOAD_CONFIG,
                payload: {}
            });
        });
    });
});
