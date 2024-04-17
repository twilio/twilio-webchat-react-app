import { useEffect, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Header } from "./Header";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { AppState } from "../store/definitions";
import { ConversationEnded } from "./ConversationEnded";
import { NotificationBar } from "./NotificationBar";
import { removeNotification } from "../store/actions/genericActions";
import { AttachFileDropArea } from "./AttachFileDropArea";
import { useNotifications } from "../hooks/useNotifications";

export const MessagingCanvasPhase = () => {
    const dispatch = useDispatch();
    const notifications = useNotifications();
    const conversationState = useSelector((state: AppState) => state.chat.conversationState);

    useEffect(() => {
        dispatch(removeNotification(notifications.failedToInitSessionNotification("ds").id));
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
