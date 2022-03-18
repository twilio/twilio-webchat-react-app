import { AnyAction } from "redux";
import { Message, Participant, User } from "@twilio/conversations";

import { ChatReducer } from "../chat.reducer";
import { ChatState } from "../definitions";
import {
    ACTION_START_SESSION,
    ACTION_ADD_MESSAGE,
    ACTION_ADD_MULTIPLE_MESSAGES,
    ACTION_ADD_PARTICIPANT,
    ACTION_ATTACH_FILES,
    ACTION_DETACH_FILES,
    ACTION_REMOVE_MESSAGE,
    ACTION_REMOVE_PARTICIPANT,
    ACTION_UPDATE_PARTICIPANT,
    ACTION_UPDATE_CONVERSATION_STATE,
    ACTION_UPDATE_MESSAGE
} from "../actions/actionTypes";

describe("Chat Reducer", () => {
    const initialState: Partial<ChatState> = {};
    const dumbFiles = [
        new File([], "a", { type: "t" }),
        new File([], "b", { type: "t" }),
        new File([], "c", { type: "t" })
    ];

    it("should return the initial state", () => {
        expect(ChatReducer(undefined, {} as AnyAction)).toEqual(initialState);
    });

    it("should initialise state when starting session", () => {
        const payload = {
            conversationsClient: "conversationsClient",
            conversation: "conversation",
            conversationState: "conversationState",
            users: "users",
            participants: "participants",
            messages: "messages"
        };
        expect(ChatReducer(initialState, { type: ACTION_START_SESSION, payload })).toEqual({
            ...initialState,
            ...payload
        });
    });

    it("should add multiple messages", () => {
        const messages: Message[] = [{ sid: "sid3" }, { sid: "sid4" }] as Message[];
        const newMessages: Message[] = [{ sid: "sid1" }, { sid: "sid2" }] as Message[];
        const state = { ...initialState, messages };
        const reduced = ChatReducer(state, { type: ACTION_ADD_MULTIPLE_MESSAGES, payload: { messages: newMessages } });

        expect(reduced.messages.length).toBe(4);
        expect(reduced.messages[0]).toEqual(newMessages[0]);
        expect(reduced.messages[1]).toEqual(newMessages[1]);
        expect(reduced.messages[2]).toEqual(messages[0]);
        expect(reduced.messages[3]).toEqual(messages[1]);
    });

    it("should add messages", () => {
        const message = {} as Message;
        expect(ChatReducer(initialState, { type: ACTION_ADD_MESSAGE, payload: { message } })).toEqual({
            ...initialState,
            messages: [message]
        });
    });

    it("should update messages", () => {
        const messages: Message[] = [{ sid: "sid1" }, { sid: "sid2" }] as Message[];
        const updatedMessage: Message = { sid: "sid2", author: "me" } as Message;
        const state = { ...initialState, messages };
        const reduced = ChatReducer(state, { type: ACTION_UPDATE_MESSAGE, payload: { message: updatedMessage } });
        expect(reduced.messages[1]).toEqual(updatedMessage);
    });

    it("should remove messages", () => {
        const messages: Message[] = [{ sid: "sid1" }, { sid: "sid2" }] as Message[];
        const state = { ...initialState, messages };
        const reduced = ChatReducer(state, { type: ACTION_REMOVE_MESSAGE, payload: { message: messages[0] } });
        expect(reduced.messages.length).toBe(1);
        expect(reduced.messages[0]).toEqual(messages[1]);
    });

    it("should add a participant", () => {
        const participant = { sid: "sid" } as Participant;
        const user = { identity: "sid" } as User;
        const reduced = ChatReducer(initialState, { type: ACTION_ADD_PARTICIPANT, payload: { participant, user } });
        expect(reduced.participants.length).toBe(1);
        expect(reduced.participants[0]).toEqual(participant);
        expect(reduced.users.length).toBe(1);
        expect(reduced.users[0]).toEqual(user);
    });

    it("should remove a participant", () => {
        const participants = [
            { sid: "sid1", identity: "foo" },
            { sid: "sid2", identity: "bar" }
        ] as Participant[];
        const users = [{ identity: "foo" }, { identity: "bar" }] as User[];
        const state = {
            ...initialState,
            participants,
            users
        };
        const reduced = ChatReducer(state, {
            type: ACTION_REMOVE_PARTICIPANT,
            payload: { participant: participants[0] }
        });

        expect(reduced.participants.length).toBe(1);
        expect(reduced.participants[0]).toEqual(participants[1]);
        expect(reduced.users.length).toBe(1);
        expect(reduced.users[0]).toEqual(users[1]);
    });

    it("should update a participant", () => {
        const participants = [
            { sid: "sid1", identity: "foo" },
            { sid: "sid2", identity: "bar" }
        ] as Participant[];
        const updatedParticipant = { sid: "sid2", identity: "barUpdated" };
        const state = {
            ...initialState,
            participants
        };
        const reduced = ChatReducer(state, {
            type: ACTION_UPDATE_PARTICIPANT,
            payload: { participant: updatedParticipant }
        });

        expect(reduced.participants.length).toBe(2);
        expect(reduced.participants[1]).toEqual(updatedParticipant);
    });

    it("shoould update conversation state", () => {
        const conversationState = "pending";
        expect(
            ChatReducer(initialState, { type: ACTION_UPDATE_CONVERSATION_STATE, payload: { conversationState } })
        ).toEqual({
            ...initialState,
            conversationState
        });
    });

    it("should return the previous state if action is unkwown", () => {
        const previousState: Partial<ChatState> = {
            attachedFiles: [dumbFiles[0]]
        };

        expect(ChatReducer(previousState, { type: "UNKNOWN_ACTION" })).toEqual(previousState);
    });

    it("should handle files being attached", () => {
        const action = {
            type: ACTION_ATTACH_FILES,
            payload: {
                filesToAttach: [dumbFiles[1]]
            }
        };
        const oldState = {
            attachedFiles: [dumbFiles[0]]
        };
        const newState = ChatReducer(oldState, action);

        expect(newState).toEqual({
            ...oldState,
            attachedFiles: [dumbFiles[0], dumbFiles[1]]
        });
    });

    it("should handle files being detached", () => {
        const action = {
            type: ACTION_DETACH_FILES,
            payload: {
                filesToDetach: [dumbFiles[1], dumbFiles[2]]
            }
        };
        const oldState = {
            ...initialState,
            attachedFiles: dumbFiles
        };
        const newState = ChatReducer(oldState, action);

        expect(newState).toEqual({
            ...oldState,
            attachedFiles: [dumbFiles[0]]
        });
    });
});
