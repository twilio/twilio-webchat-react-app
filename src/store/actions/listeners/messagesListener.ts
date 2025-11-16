import { Conversation, Message } from "@twilio/conversations";
import { Dispatch } from "redux";

import { ACTION_ADD_MESSAGE, ACTION_REMOVE_MESSAGE, ACTION_UPDATE_MESSAGE } from "../actionTypes";

export const initMessagesListener = (conversation: Conversation, dispatch: Dispatch) => {
    conversation.addListener("messageAdded", (message: Message) => {
        // Filter out system messages so they don't appear to customers
        if (message.author === "System") {
            return;
        }
        
        dispatch({
            type: ACTION_ADD_MESSAGE,
            payload: { message }
        });
    });
    conversation.addListener("messageRemoved", (message: Message) => {
        dispatch({
            type: ACTION_REMOVE_MESSAGE,
            payload: { message }
        });
    });
    conversation.addListener("messageUpdated", ({ message }) => {
        dispatch({
            type: ACTION_UPDATE_MESSAGE,
            payload: { message }
        });
    });
};
