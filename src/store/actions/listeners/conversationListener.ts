import { Conversation } from "@twilio/conversations";
import { Dispatch } from "redux";

import { ACTION_UPDATE_CONVERSATION_STATE } from "../actionTypes";

export const initConversationListener = (conversation: Conversation, dispatch: Dispatch) => {
    conversation.addListener("updated", ({ conversation: updatedConversation, updateReasons }) => {
        // we are listening only to a subset of events.
        if (updateReasons?.includes("state")) {
            dispatch({
                type: ACTION_UPDATE_CONVERSATION_STATE,
                payload: { conversationState: updatedConversation?.state?.current }
            });
        }
    });
};
