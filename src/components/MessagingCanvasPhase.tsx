import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Header } from "./Header";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { AppState } from "../store/definitions";
import { ConversationEnded } from "./ConversationEnded";
import { NotificationBar } from "./NotificationBar";
import { removeNotification, updatePreEngagementData } from "../store/actions/genericActions";
import { notifications } from "../notifications";

export const MessagingCanvasPhase = () => {
    const dispatch = useDispatch();
    const conversationState = useSelector((state: AppState) => state.chat.conversationState);

    useEffect(() => {
        dispatch(updatePreEngagementData({ email: "", name: "", query: "" }));
        dispatch(removeNotification(notifications.failedToInitSessionNotification("ds").id));
    }, [dispatch]);

    return (
        <>
            <Header />
            <NotificationBar />
            <MessageList />
            {conversationState === "active" ? <MessageInput /> : <ConversationEnded />}
        </>
    );
};
