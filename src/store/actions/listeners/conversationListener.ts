import { Conversation } from "@twilio/conversations";
import { Dispatch } from "redux";

import { ACTION_UPDATE_CONVERSATION_STATE } from "../actionTypes";

export const initConversationListener = (conversation: Conversation, dispatch: Dispatch) => {
    conversation.addListener("updated", ({ conversation: updatedConversation, updateReasons }) => {
        // we are listening only to a subset of events.
        if (updateReasons?.includes("state")) {
            const newState = updatedConversation?.state?.current;
            const previousState = conversation.state?.current;
            
            console.log('🔄 Conversation state change detected:', {
                previousState,
                newState,
                updateReasons,
                conversationSid: conversation.sid
            });
            
            // Detect when conversation is closed by agent
            if (newState === "closed" || newState === "inactive") {
                console.log(`🎯 Chat closed. New state: ${newState}`);
                console.log(`📊 State transition: ${previousState} → ${newState}`);
                /*
                 * You can add custom logic here to handle chat closure
                 * For example, show a notification to the customer
                 */
            }
            
            dispatch({
                type: ACTION_UPDATE_CONVERSATION_STATE,
                payload: { conversationState: newState }
            });
            
            console.log('✅ Conversation state updated in Redux store:', newState);
        }
    });
};
