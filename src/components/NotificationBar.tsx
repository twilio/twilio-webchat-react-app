import { Box } from "@twilio-paste/core/box";
import { useSelector } from "react-redux";

import { AppState } from "../store/definitions";
import { NotificationBarItem } from "./NotificationBarItem";
import { notificationBarContainerStyles, notificationBarStyles } from "./styles/NotificationBar.styles";

export const NotificationBar = () => {
    const notifications = useSelector((store: AppState) => store.notifications);

    return (
        <Box {...notificationBarContainerStyles}>
            <Box {...notificationBarStyles}>
                {notifications.map((notification) => (
                    <NotificationBarItem key={notification.id} {...notification} />
                ))}
            </Box>
        </Box>
    );
};
