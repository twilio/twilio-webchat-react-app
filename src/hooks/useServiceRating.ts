/* eslint-disable consistent-return */
import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Participant } from '@twilio/conversations';

import { ratingService, RatingSubmission } from '../services/ratingService';
import { AppState, EngagementPhase } from '../store/definitions';
import { changeEngagementPhase, updatePreEngagementData, changeExpandedStatus } from '../store/actions/genericActions';
import { sessionDataHandler } from '../sessionDataHandler';

// Type for participant with worker attributes
interface ParticipantWithWorkerAttributes extends Participant {
    workerAttributes?: {
        workerSid: string;
        workerIdentity: string;
        workerFriendlyName: string;
        workerEmail: string;
        workerAttributes: Record<string, any>;
        workspaceSid: string;
    };
}

interface UseServiceRatingReturn {
    showRatingModal: boolean;
    isLoading: boolean;
    hasRated: boolean;
    openRatingModal: () => void;
    closeRatingModal: () => void;
    submitRating: (rating: number, feedback?: string) => Promise<void>;
    handleSkipRating: () => Promise<void>;
}

export const useServiceRating = (): UseServiceRatingReturn => {
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasRated, setHasRated] = useState(false);

    const conversationSid = useSelector((state: AppState) => state.session.conversationSid);
    const conversationState = useSelector((state: AppState) => state.chat.conversationState);
    const participants = useSelector((state: AppState) => state.chat.participants);
    const users = useSelector((state: AppState) => state.chat.users);
    const conversation = useSelector((state: AppState) => state.chat.conversation);

    const dispatch = useDispatch();

    // Check if conversation has already been rated
    useEffect(() => {
        const checkRatingStatus = async () => {
            if (conversationSid) {
                try {
                    const rated = await ratingService.hasBeenRated(conversationSid);
                    setHasRated(rated);
                } catch (error) {
                    console.error('Error checking rating status:', error);
                }
            }
        };

        checkRatingStatus();
    }, [conversationSid]);

    // Show rating modal when conversation is closed and hasn't been rated
    useEffect(() => {
        console.log('🔄 useServiceRating useEffect triggered:', {
            conversationState,
            hasRated,
            conversationSid: Boolean(conversationSid),
            shouldShowModal: conversationState === 'closed' && !hasRated && Boolean(conversationSid)
        });
        
        if (conversationState === 'closed' && !hasRated && conversationSid) {
            console.log('⭐ Conversation closed and not rated - scheduling rating modal to appear');
            // Small delay to ensure the closure is processed
            const timer = setTimeout(() => {
                console.log('🎯 Showing rating modal after conversation closure');
                setShowRatingModal(true);
            }, 1000);

            return () => {
                console.log('⏰ Clearing rating modal timer');
                clearTimeout(timer);
            };
        }
    }, [conversationState, hasRated, conversationSid]);

    const openRatingModal = useCallback(() => {
        console.log('Opening rating modal manually');
        setShowRatingModal(true);
    }, []);

    const closeRatingModal = useCallback(() => {
        console.log('Closing rating modal');
        setShowRatingModal(false);
    }, []);

    const closeConversation = useCallback(async () => {
        try {
            // Try to close conversation if it's not already closed
            if (conversation && conversationState !== 'closed') {
                await conversation.leave();
                console.log('Conversation closed after rating');
            }
            
            // Always clear session data and reset to pre-engagement form
            console.log('Resetting chat to pre-engagement form');
            sessionDataHandler.clear();
            dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
            dispatch(updatePreEngagementData({ name: '', email: '', query: '' })); // Clear pre-engagement form data
            dispatch(changeExpandedStatus({ expanded: false })); // Minimize chat widget
        } catch (error) {
            console.error('Error in closeConversation:', error);
            // Even if there's an error, still try to reset the chat
            try {
                sessionDataHandler.clear();
                dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
                dispatch(updatePreEngagementData({ name: '', email: '', query: '' })); // Clear pre-engagement form data
                dispatch(changeExpandedStatus({ expanded: false })); // Minimize chat widget
            } catch (resetError) {
                console.error('Error resetting chat:', resetError);
            }
        }
    }, [conversation, conversationState, dispatch]);

    const handleSkipRating = useCallback(async () => {
        closeRatingModal();
        await closeConversation();
    }, [closeRatingModal, closeConversation]);

    // eslint-disable-next-line consistent-return
    const submitRating = useCallback(async (rating: number, feedback?: string): Promise<void> => {
        if (!conversationSid) {
            throw new Error('No conversation SID available');
        }

        setIsLoading(true);

        try {
            /*
             * Get agent identity from participants
             * Agent is the participant that is NOT the local participant (customer)
             */
            const localParticipantIdentity = (conversation as { localParticipant?: { identity?: string } }).localParticipant?.identity;
            const agentParticipant = participants?.find(p => p.identity !== localParticipantIdentity);
            const agentIdentity = agentParticipant?.identity;

            // Get agent name from users array
            const agentUser = users?.find(u => u.identity === agentIdentity);
            const agentName = agentUser?.friendlyName || agentIdentity || "";

            // Get worker attributes if available (stored when agent joined)
            const workerAttributes = (agentParticipant as ParticipantWithWorkerAttributes)?.workerAttributes;
            const agentEmail = workerAttributes?.workerEmail || "";
            const workerSid = workerAttributes?.workerSid || "";

            // Get customer email from the local participant's friendlyName
            const customerEmail = localParticipantIdentity; // The local participant identity is the customer email

            console.log('🔍 Rating data collection:', {
                localParticipantIdentity,
                agentParticipant: agentParticipant?.identity,
                agentIdentity,
                agentName,
                agentEmail,
                workerSid,
                customerEmail,
                participantsCount: participants?.length,
                usersCount: users?.length,
                hasWorkerAttributes: Boolean(workerAttributes)
            });

            const ratingData: RatingSubmission = {
                conversationSid,
                rating,
                feedback,
                customerEmail,
                agentIdentity,
                agentName, // Add agent name to rating data
                agentEmail, // Add agent email from worker attributes
                workerSid, // Add worker SID for reference
                closureType: 'customer_closed', // Updated to reflect customer closure
                timestamp: new Date(),
            };

            const success = await ratingService.submitRating(ratingData);
            
            if (success) {
                setHasRated(true);
                setShowRatingModal(false);
                await closeConversation(); // Close conversation after successful rating
            } else {
                throw new Error('Failed to submit rating');
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [conversationSid, participants, users, closeConversation]);

    return {
        showRatingModal,
        isLoading,
        hasRated,
        openRatingModal,
        closeRatingModal,
        submitRating,
        handleSkipRating,
    };
};
