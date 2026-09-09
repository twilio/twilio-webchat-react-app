import { Client, Message, Participant, User } from "@twilio/conversations";
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
import { sessionDataHandler } from "../../sessionDataHandler";

export function initConfig(config: ConfigState) {
    return {
        type: ACTION_LOAD_CONFIG,
        payload: config
    };
}

export function initSession({ token, conversationSid }: { token: string; conversationSid: string }) {
    return async (dispatch: Dispatch) => {
        let conversationsClient: Client;
        let conversation;
        let participants;
        let users;
        let messages;

        try {
            conversationsClient = await Client.create(token);
            try {
                conversation = await conversationsClient.getConversationBySid(conversationSid);
            } catch (e) {
                // Once a conversation is closed (e.g. the agent ends the chat), Twilio denies the
                // customer's own identity-scoped SDK access to it - even with a brand new token -
                // while the participant record itself still exists. Fall back to a read-only
                // transcript from our own backend (account-level access) before giving up, so a
                // reload after the chat has ended still shows the conversation instead of failing.
                const transcript = await sessionDataHandler.getTranscript({ token, conversationSid });

                if (!transcript) {
                    dispatch(
                        addNotification(notifications.failedToInitSessionNotification("Couldn't load conversation"))
                    );
                    dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
                    return;
                }

                dispatch({
                    type: ACTION_START_SESSION,
                    payload: {
                        token,
                        conversationSid,
                        // No live SDK client/conversation exist for a read-only transcript - every
                        // access to these elsewhere in the app is already optional-chained, so this
                        // degrades safely (no real-time features, which is correct: there's nothing
                        // "live" left to listen to in a closed conversation).
                        conversationsClient: undefined,
                        conversation: undefined,
                        users: transcript.users as unknown as User[],
                        participants: transcript.participants as unknown as Participant[],
                        messages: transcript.messages.map((message) => ({
                            ...message,
                            dateCreated: new Date(message.dateCreated),
                            dateUpdated: new Date(message.dateUpdated),
                            // Wrap the server's pre-fetched URL in the same method signature
                            // Transcript.tsx/FilePreview.tsx already call on a real SDK Media
                            // instance (`await media.getContentTemporaryUrl()`) - so neither of
                            // those files need to know or care this isn't a live SDK object.
                            attachedMedia:
                                message.attachedMedia?.map((media) => ({
                                    ...media,
                                    getContentTemporaryUrl: async () => media.temporaryUrl
                                })) ?? null
                        })) as unknown as Message[],
                        conversationState: transcript.conversationState,
                        currentPhase: EngagementPhase.MessagingCanvas
                    }
                });
                return;
            }

            participants = await conversation.getParticipants();
            users = await Promise.all(participants.map(async (p) => p.getUser()));
            messages = (await conversation.getMessages(MESSAGES_LOAD_COUNT)).items;
        } catch (e) {
            log.error("Something went wrong when initializing session", e);
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
                currentPhase: EngagementPhase.MessagingCanvas
            }
        });

        initClientListeners(conversationsClient, dispatch);
        initConversationListener(conversation, dispatch);
        initMessagesListener(conversation, dispatch);
        initParticipantsListener(conversation, dispatch);
    };
}
