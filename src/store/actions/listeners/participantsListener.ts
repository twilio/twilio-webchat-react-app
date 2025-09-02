import { Conversation, Participant } from "@twilio/conversations";
import { Dispatch } from "redux";

import { ACTION_ADD_PARTICIPANT, ACTION_REMOVE_PARTICIPANT, ACTION_UPDATE_PARTICIPANT, ACTION_UPDATE_CONVERSATION_STATE } from "../actionTypes";

export const initParticipantsListener = (conversation: Conversation, dispatch: Dispatch) => {
    conversation.addListener("participantJoined", async (participant: Participant) => {
        const user = await participant.getUser();
        
        // Check if this is an agent (not the local participant/customer)
        const localParticipantIdentity = (conversation as { localParticipant?: { identity?: string } }).localParticipant?.identity;
        const isAgent = user.identity !== localParticipantIdentity;
        
        if (isAgent) {
            console.log('🔄 Agent joined conversation:', {
                agentIdentity: user.identity,
                agentName: user.friendlyName,
                conversationSid: conversation.sid
            });
            
            // Try to fetch worker attributes from Flex
            try {
                const response = await fetch(`${process.env.REACT_APP_SERVER_URL || 'http://localhost:3002'}/getWorkerAttributes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        agentIdentity: user.identity
                    }),
                });
                
                if (response.ok) {
                    const workerData = await response.json();
                    console.log('✅ Worker attributes fetched:', workerData);
                    
                    // Store worker attributes in participant attributes for later use
                    const participantWithWorkerData = {
                        ...participant,
                        workerAttributes: workerData
                    };
                    
                    dispatch({
                        type: ACTION_ADD_PARTICIPANT,
                        payload: { participant: participantWithWorkerData, user }
                    });
                    return;
                }
            } catch (error) {
                console.error('❌ Error fetching worker attributes:', error);
            }
        }
        
        // Default dispatch for customer or if worker fetch fails
        dispatch({
            type: ACTION_ADD_PARTICIPANT,
            payload: { participant, user }
        });
    });

    conversation.addListener("participantLeft", async (participant: Participant) => {
        // Get participant details
        const user = await participant.getUser();
        const localParticipantIdentity = (conversation as { localParticipant?: { identity?: string } }).localParticipant?.identity;
        const isAgent = user.identity !== localParticipantIdentity;
        
        console.log('🔄 Participant left conversation:', {
            participantIdentity: user.identity,
            localParticipantIdentity,
            isAgent,
            conversationSid: conversation.sid
        });
        
        // Check if conversation is actually ending (no remaining participants)
        const remainingParticipants = await conversation.getParticipants();
        console.log('📊 Remaining participants after leave:', remainingParticipants.length);
        
        if (remainingParticipants.length === 0) {
            // Conversation is actually ending - trigger rating modal
            console.log('🎯 Conversation ending (no remaining participants) - triggering conversation state change to closed');
            dispatch({
                type: ACTION_UPDATE_CONVERSATION_STATE,
                payload: { conversationState: 'closed' }
            });
        } else {
            console.log('ℹ️ Conversation continuing (participants remain) - not triggering rating modal');
        }
        
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
