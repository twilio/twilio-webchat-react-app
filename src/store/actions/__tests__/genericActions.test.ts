import { Message, Conversation } from "@twilio/conversations";
import { applyMiddleware, combineReducers, createStore, compose } from "redux";
import thunk from "redux-thunk";

import { MockedPaginator } from "../../../test-utils";
import {
    addNotification,
    attachFiles,
    changeEngagementPhase,
    changeExpandedStatus,
    detachFiles,
    getMoreMessages,
    removeNotification
} from "../genericActions";
import { EngagementPhase, Notification } from "../../definitions";
import {
    ACTION_ADD_MULTIPLE_MESSAGES,
    ACTION_ADD_NOTIFICATION,
    ACTION_ATTACH_FILES,
    ACTION_DETACH_FILES,
    ACTION_REMOVE_NOTIFICATION
} from "../actionTypes";
import { SessionReducer } from "../../session.reducer";

jest.mock("@twilio/conversations");

const createSessionStore = () =>
    createStore(
        combineReducers({
            session: SessionReducer
        }),
        compose(applyMiddleware(thunk))
    );

describe("Actions", () => {
    const messages = [{ sid: "sid1" }, { sid: "sid2" }] as Message[];
    const users = [{ idenity: "id" }];
    const participants = [{ getUser: () => users[0] }];
    const conversation = {
        state: { current: "active" },
        getParticipants: () => participants,
        getMessages: () => new MockedPaginator(messages)
    } as unknown as Conversation;
    const notification: Notification = {
        message: "Test notification",
        id: "TestNotification",
        type: "neutral",
        dismissible: false
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockStore: any;

    beforeEach(() => {
        mockStore = createSessionStore();
    });

    describe("getMoreMessages", () => {
        it("returns add multiple messages action", () => {
            mockStore.dispatch(getMoreMessages({ anchor: 0, conversation })).then((resolved: object) => {
                expect(resolved).toEqual({
                    type: ACTION_ADD_MULTIPLE_MESSAGES,
                    payload: {
                        messages
                    }
                });
            });
        });
    });

    describe("changeExpandedStatus", () => {
        it("dispatches change change expanded status action", async () => {
            expect(mockStore.getState().session.expanded).toEqual(false);
            mockStore.dispatch(changeExpandedStatus({ expanded: true }));
            expect(mockStore.getState().session.expanded).toEqual(true);
        });
    });

    describe("changeEngagementPhase", () => {
        it("dispatches change engagement phase action", () => {
            expect(mockStore.getState().session.currentPhase).toEqual(EngagementPhase.Loading);
            mockStore.dispatch(changeEngagementPhase({ phase: EngagementPhase.MessagingCanvas }));
            expect(mockStore.getState().session.currentPhase).toEqual(EngagementPhase.MessagingCanvas);
        });
    });

    describe("attachFiles", () => {
        it("returns attach files action", () => {
            const files = [{ name: "filename.jpg", type: "image/jpeg", size: 1, lastModified: 1 }] as File[];

            expect(attachFiles(files)).toEqual({
                type: ACTION_ATTACH_FILES,
                payload: {
                    filesToAttach: files
                }
            });
        });
    });

    describe("detachFiles", () => {
        it("returns detach files action", () => {
            const files = [{ name: "filename.jpg", type: "image/jpeg", size: 1, lastModified: 1 }] as File[];

            expect(detachFiles(files)).toEqual({
                type: ACTION_DETACH_FILES,
                payload: {
                    filesToDetach: files
                }
            });
        });
    });

    describe("addNotification", () => {
        it("returns add notification action", () => {
            expect(addNotification(notification)).toEqual({
                type: ACTION_ADD_NOTIFICATION,
                payload: {
                    notification
                }
            });
        });
    });

    describe("removeNotification", () => {
        it("returns remove notification action", () => {
            expect(removeNotification(notification.id)).toEqual({
                type: ACTION_REMOVE_NOTIFICATION,
                payload: {
                    id: notification.id
                }
            });
        });
    });
});
