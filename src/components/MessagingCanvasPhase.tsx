import { useEffect, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Conversation } from "@twilio/conversations";

import { Header } from "./Header";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { AppState } from "../store/definitions";
import { ConversationEnded } from "./ConversationEnded";
import { NotificationBar } from "./NotificationBar";
import { removeNotification } from "../store/actions/genericActions";
import { notifications } from "../notifications";
import { AttachFileDropArea } from "./AttachFileDropArea";


const sendInitialUserQuery = async (conv?: Conversation, query?: string): Promise<void> => {
    if (!query || !conv) return;

    const totalMessagesCount = await conv.getMessagesCount();

    if (!totalMessagesCount) {
        conv.prepareMessage()
            .setBody(query)
            .build()
            .send(); 
    } 
}

export const MessagingCanvasPhase = () => {
    const dispatch = useDispatch();

    const { conversation, conversationState, preEngagmentData } = useSelector((state: AppState) => ({
        conversationState: state.chat.conversationState,
        conversation: state.chat?.conversation,
        preEngagmentData: state.session?.preEngagementData
    }));

    useEffect(() => {
        dispatch(removeNotification(notifications.failedToInitSessionNotification("ds").id));
        sendInitialUserQuery(conversation as Conversation, preEngagmentData?.query);
    }, [dispatch]);

    const Wrapper = conversationState === "active" ? AttachFileDropArea : Fragment;

    return (
        <Wrapper>
            <Header />
            <NotificationBar />
            <MessageList />
            {conversationState === "active" ? <MessageInput /> : <ConversationEnded />}
        </Wrapper>
    );
};
