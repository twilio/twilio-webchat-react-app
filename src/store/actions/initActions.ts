import { Client } from "@twilio/conversations";
import { Dispatch } from "redux";

import { initMessagesListener } from "./listeners/messagesListener";
import { initParticipantsListener } from "./listeners/participantsListener";
import { initConversationListener } from "./listeners/conversationListener";
import { ConfigState, EngagementPhase } from "../definitions";
import { initClientListeners } from "./listeners/clientListener";
import { notifications } from "../../notifications";
import { ACTION_START_SESSION, ACTION_LOAD_CONFIG } from "./actionTypes";
import { addNotification, changeEngagementPhase } from "./genericActions";
import { MESSAGES_LOAD_COUNT } from "../../constants";
import { parseRegionForConversations } from "../../utils/regionUtil";
import { sessionDataHandler } from "../../sessionDataHandler";
import { createParticipantNameMap } from "../../utils/participantNameMap";

export function initConfig(config: ConfigState) {
    return {
        type: ACTION_LOAD_CONFIG,
        payload: config
    };
}

export type InitSessionPayload = {
    token: string;
    conversationSid: string;
};

export function initSession({ token, conversationSid }: InitSessionPayload) {
    const logger = window.Twilio.getLogger("initSession");
    return async (dispatch: Dispatch) => {
        let conversationsClient: Client;
        let conversation;
        let participants;
        let users;
        let messages;
        let participantNameMap;

        try {
            conversationsClient = await Client.create(token, {
                region: parseRegionForConversations(sessionDataHandler.getRegion())
            });
            try {
                conversation = await conversationsClient.getConversationBySid(conversationSid);
            } catch (e) {
                dispatch(addNotification(notifications.failedToInitSessionNotification("Couldn't load conversation")));
                dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
                return;
            }

            participants = await conversation.getParticipants();
            users = await Promise.all(participants.map(async (p) => p.getUser()));
            messages = (await conversation.getMessages(MESSAGES_LOAD_COUNT)).items;

            /*
             * TODO:  If we have an existing participantNameMap for this conversationSid,
             *  in localStorage, use it and update it with the new participants.
             */

            participantNameMap = createParticipantNameMap(participants, users, conversation);
    
        } catch (e) {
            logger.error("Something went wrong when initializing session", e);
            throw e;
        }

        dispatch({
            type: ACTION_START_SESSION,
            payload: {
                token,
                conversationSid,
                conversationsClient,
                conversation,
                users,
                participants,
                messages,
                conversationState: conversation.state?.current,
                currentPhase: EngagementPhase.MessagingCanvas,
                participantNames: participantNameMap
            }
        });

        initClientListeners(conversationsClient, dispatch);
        initConversationListener(conversation, dispatch);
        initMessagesListener(conversation, dispatch);
        initParticipantsListener(conversation, dispatch);
    };
}
