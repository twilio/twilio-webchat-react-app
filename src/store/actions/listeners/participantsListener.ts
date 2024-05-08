import { WebChatClient } from "@twilio/webchat";
import { Dispatch } from "redux";

import { ACTION_ADD_PARTICIPANT, ACTION_REMOVE_PARTICIPANT, ACTION_UPDATE_PARTICIPANT } from "../actionTypes";

export const initParticipantsListener = (webchatClient: WebChatClient, dispatch: Dispatch) => {
    // webchatClient.addListener("participantJoined", async (participant: Participant) => {
    //     const user = await participant.getUser();
    //     dispatch({
    //         type: ACTION_ADD_PARTICIPANT,
    //         payload: { participant, user }
    //     });
    // });

    // webchatClient.addListener("participantLeft", (participant: Participant) => {
    //     dispatch({
    //         type: ACTION_REMOVE_PARTICIPANT,
    //         payload: { participant }
    //     });
    // });

    const dispatchParticipantUpdate = (participant: Participant) => {
        dispatch({
            type: ACTION_UPDATE_PARTICIPANT,
            payload: { participant }
        });
    };
    // webchatClient.addListener("participantUpdated", ({ participant }) => dispatchParticipantUpdate(participant));
    webchatClient.addListener(WebChatClient.typingStarted, dispatchParticipantUpdate);
    webchatClient.addListener(WebChatClient.typingEnded, dispatchParticipantUpdate);
};
