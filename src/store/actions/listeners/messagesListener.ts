import { WebChatClient, Message } from "@twilio/webchat";
import { Dispatch } from "redux";

import { ACTION_ADD_MESSAGE, ACTION_REMOVE_MESSAGE, ACTION_UPDATE_MESSAGE } from "../actionTypes";

export const initMessagesListener = (webchatClient: WebChatClient, dispatch: Dispatch) => {
    webchatClient.addListener(WebChatClient.messageReceived, (message: Message) => {
        dispatch({
            type: ACTION_ADD_MESSAGE,
            payload: { message }
        });
    });
    webchatClient.addListener(WebChatClient.messageRemoved, (message: Message) => {
        dispatch({
            type: ACTION_REMOVE_MESSAGE,
            payload: { message }
        });
    });
    webchatClient.addListener(WebChatClient.messageEdited, ({ message }) => {
        dispatch({
            type: ACTION_UPDATE_MESSAGE,
            payload: { message }
        });
    });
};
