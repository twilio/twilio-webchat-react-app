import { AnyAction, Reducer } from "redux";
import { Message } from "@twilio/webchat";

import { ChatState } from "./definitions";
import {
    ACTION_ATTACH_FILES,
    ACTION_ADD_MESSAGE,
    ACTION_ADD_MULTIPLE_MESSAGES,
    ACTION_ADD_PARTICIPANT,
    ACTION_DETACH_FILES,
    ACTION_REMOVE_MESSAGE,
    ACTION_REMOVE_PARTICIPANT,
    ACTION_START_SESSION,
    ACTION_UPDATE_CONVERSATION_STATE,
    ACTION_UPDATE_MESSAGE,
    ACTION_UPDATE_PARTICIPANT
} from "./actions/actionTypes";

const initialState: ChatState = {};

function detachFiles(attachedFiles: File[] = [], filesToDetach: File[] = []): File[] {
    return (attachedFiles || []).filter(
        (file: File) =>
            !filesToDetach.some(
                (fileToDetach: File) =>
                    file.name === fileToDetach.name &&
                    file.type === fileToDetach.type &&
                    file.size === fileToDetach.size
            )
    );
}

export const ChatReducer: Reducer = (state: ChatState = initialState, action: AnyAction): ChatState => {
    switch (action.type) {
        case ACTION_START_SESSION: {
            return {
                ...state,
                webchatClient: action.payload.webchatClient,
                conversation: action.payload.conversation,
                conversationState: action.payload.conversationState,
                messages: action.payload.messages
            };
        }
        case ACTION_ADD_MULTIPLE_MESSAGES: {
            return {
                ...state,
                messages: [...action.payload.messages, ...(state.messages || [])]
            };
        }
        case ACTION_ADD_MESSAGE: {
            return {
                ...state,
                messages: [...(state.messages || []), action.payload.message]
            };
        }
        case ACTION_REMOVE_MESSAGE: {
            return {
                ...state,
                messages: [...(state.messages || []).filter((m) => m.sid !== action.payload.message.sid)]
            };
        }
        case ACTION_UPDATE_MESSAGE: {
            return {
                ...state,
                messages: [
                    ...(state.messages || []).reduce((acc: Message[], m) => {
                        if (m.sid === action.payload.message.sid) {
                            acc.push(action.payload.message);
                        } else {
                            acc.push(m);
                        }
                        return acc;
                    }, [])
                ]
            };
        }
        case ACTION_ATTACH_FILES: {
            return {
                ...state,
                attachedFiles: [...(state.attachedFiles || []), ...action.payload.filesToAttach]
            };
        }
        case ACTION_DETACH_FILES: {
            const filesToDetach = action.payload.filesToDetach as File[];
            return {
                ...state,
                attachedFiles: detachFiles(state.attachedFiles, filesToDetach)
            };
        }
        case ACTION_ADD_PARTICIPANT: { // @todo No-op
            return {
                ...state
            };
        }
        case ACTION_REMOVE_PARTICIPANT: { // @todo No-op
            return {
                ...state
            };
        }
        case ACTION_UPDATE_PARTICIPANT: { // @todo No-op
            return {
                ...state
            };
        }
        case ACTION_UPDATE_CONVERSATION_STATE: {
            return {
                ...state,
                conversationState: action.payload.conversationState
            };
        }

        default:
            return state;
    }
};
