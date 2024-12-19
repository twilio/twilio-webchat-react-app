import { WebChatClient } from "@twilio/webchat";
import { Dispatch } from "redux";
import log from "loglevel";

import { initMessagesListener } from "./listeners/messagesListener";
import { initParticipantsListener } from "./listeners/participantsListener";
import { initConversationListener } from "./listeners/conversationListener";
import { ConfigState, EngagementPhase } from "../definitions";
import { initClientListeners } from "./listeners/clientListener";
import { notifications } from "../../notifications";
import { ACTION_START_SESSION, ACTION_LOAD_CONFIG } from "./actionTypes";
import { addNotification, changeEngagementPhase } from "./genericActions";
import { MESSAGES_LOAD_COUNT } from "../../constants";

export function initConfig(config: ConfigState) {
    return {
        type: ACTION_LOAD_CONFIG,
        payload: config
    };
}

export function initSession({ token, conversationSid }: { token: string; conversationSid: string }) {
    return async (dispatch: Dispatch) => {
        let webchatClient: WebChatClient;
        let messages;

        try {
            webchatClient = new WebChatClient(token, conversationSid);
            await webchatClient.ready; // @todo set up signal await here -- not needed, as getMessages will wait for it
            messages = (await webchatClient.getMessages(MESSAGES_LOAD_COUNT)).items;
        } catch (e) {
            log.error("Something went wrong when initializing session", e);
            throw e;
        }

        dispatch({
            type: ACTION_START_SESSION,
            payload: {
                token,
                conversationSid,
                webchatClient,
                messages,
                conversationState: conversation.state?.current,
                currentPhase: EngagementPhase.MessagingCanvas
            }
        });

        initClientListeners(webchatClient, dispatch);
        // initConversationListener(conversation, dispatch);
        initMessagesListener(webchatClient, dispatch);
        initParticipantsListener(webchatClient, dispatch); // typing events
    };
}
