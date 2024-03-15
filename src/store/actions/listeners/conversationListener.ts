import { Conversation } from "@twilio/conversations";
import { Dispatch } from "redux";

import { ACTION_UPDATE_CONVERSATION_STATE } from "../actionTypes";

export const initConversationListener = (conversation: Conversation, dispatch: Dispatch) => {
    conversation.addListener("updated", async ({ conversation: updatedConversation, updateReasons }) => {
        // we are listening only to a subset of events.
        if (updateReasons?.includes("state")) {
            dispatch({
                type: ACTION_UPDATE_CONVERSATION_STATE,
                payload: { conversationState: updatedConversation?.state?.current }
            });
        }

        /**
         * Note: The only distinction that we can make to check if the conversation
         * started is from the number of participants in the conversation. If it is 1,
         * then it means that the conversation has started, i.e. no Agent has joined
         * yet.
         *
         */
        const participantCount = await updatedConversation.getParticipantsCount();
        if (participantCount === 1) {
            localStorage.removeItem("TWILIO_CONVERSATION_USERS");
        }
    });
};
