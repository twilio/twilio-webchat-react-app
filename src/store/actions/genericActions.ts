import { Dispatch } from "redux";
import { Conversation } from "@twilio/conversations";

import { EngagementPhase, Notification, PreEngagementData } from "../definitions";
import {
    ACTION_ADD_MULTIPLE_MESSAGES,
    ACTION_ADD_NOTIFICATION,
    ACTION_ATTACH_FILES,
    ACTION_CHANGE_ENGAGEMENT_PHASE,
    ACTION_CHANGE_EXPANDED_STATUS,
    ACTION_DETACH_FILES,
    ACTION_REMOVE_NOTIFICATION,
    ACTION_UPDATE_PRE_ENGAGEMENT_DATA
} from "./actionTypes";
import { MESSAGES_LOAD_COUNT } from "../../constants";

export function changeEngagementPhase({ phase }: { phase: EngagementPhase }) {
    return {
        type: ACTION_CHANGE_ENGAGEMENT_PHASE,
        payload: {
            currentPhase: phase
        }
    };
}

export function addNotification(notification: Notification) {
    return {
        type: ACTION_ADD_NOTIFICATION,
        payload: {
            notification
        }
    };
}

export function removeNotification(id: string) {
    return {
        type: ACTION_REMOVE_NOTIFICATION,
        payload: {
            id
        }
    };
}

export function getMoreMessages({ anchor, conversation }: { anchor: number; conversation: Conversation }) {
    return async (dispatch: Dispatch) =>
        dispatch({
            type: ACTION_ADD_MULTIPLE_MESSAGES,
            payload: {
                messages: (await conversation.getMessages(MESSAGES_LOAD_COUNT, anchor)).items
            }
        });
}

export function changeExpandedStatus({ expanded }: { expanded: boolean }) {
    return {
        type: ACTION_CHANGE_EXPANDED_STATUS,
        payload: {
            expanded
        }
    };
}

export function attachFiles(files: File[]) {
    return {
        type: ACTION_ATTACH_FILES,
        payload: {
            filesToAttach: files
        }
    };
}

export function detachFiles(files: File[]) {
    return {
        type: ACTION_DETACH_FILES,
        payload: {
            filesToDetach: files
        }
    };
}

export function updatePreEngagementData(data: Partial<PreEngagementData>) {
    return {
        type: ACTION_UPDATE_PRE_ENGAGEMENT_DATA,
        payload: {
            preEngagementData: data
        }
    };
}
