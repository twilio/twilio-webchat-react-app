import { Conversation, Participant } from "@twilio/conversations";
import { Dispatch } from "redux";

import { ACTION_ADD_PARTICIPANT, ACTION_REMOVE_PARTICIPANT, ACTION_UPDATE_PARTICIPANT } from "../actionTypes";
import { LocalStorageUtil } from "../../../utils/LocalStorage";

type ParticipantList = {
    [participantSid: string]: string;
};

export const initParticipantsListener = (conversation: Conversation, dispatch: Dispatch) => {
    conversation.addListener("participantJoined", async (participant: Participant) => {
        const conversationUsers = LocalStorageUtil.get("TWILIO_CONVERSATION_USERS");
        const user = await participant.getUser();
        const userFriendlyName = user.friendlyName;
        const allUsers: ParticipantList = conversationUsers ? conversationUsers : {};
        allUsers[participant.sid] = userFriendlyName;
        LocalStorageUtil.set("TWILIO_CONVERSATION_USERS", allUsers);
        dispatch({
            type: ACTION_ADD_PARTICIPANT,
            payload: { participant, user }
        });
    });

    conversation.addListener("participantLeft", (participant: Participant) => {
        dispatch({
            type: ACTION_REMOVE_PARTICIPANT,
            payload: { participant }
        });
    });

    const dispatchParticipantUpdate = (participant: Participant) => {
        dispatch({
            type: ACTION_UPDATE_PARTICIPANT,
            payload: { participant }
        });
    };
    conversation.addListener("participantUpdated", ({ participant }) => dispatchParticipantUpdate(participant));
    conversation.addListener("typingStarted", dispatchParticipantUpdate);
    conversation.addListener("typingEnded", dispatchParticipantUpdate);
};
