import { Client } from "@twilio/conversations";
import { Dispatch } from "redux";

import { sessionDataHandler } from "../../../sessionDataHandler";
import { notifications } from "../../../notifications";
import { addNotification, removeNotification } from "../genericActions";
import { ACTION_UPDATE_SESSION_DATA } from "../actionTypes";

export const initClientListeners = (conversationClient: Client, dispatch: Dispatch) => {
    const tokenAboutToExpireEvent = "tokenAboutToExpire";
    const connectionStateChangedEvent = "connectionStateChanged";
    const logger = window.Twilio.getLogger("conversationClientListener");

    // remove any other refresh handler added before and add it again
    conversationClient.removeAllListeners(tokenAboutToExpireEvent);
    conversationClient.addListener(tokenAboutToExpireEvent, async () => {
        logger.warn("token about to expire");

        const data = await sessionDataHandler.getUpdatedToken();
        if (data?.token && data?.conversationSid) {
            await conversationClient.updateToken(data.token);
            dispatch({
                type: ACTION_UPDATE_SESSION_DATA,
                payload: {
                    token: data.token,
                    conversationSid: data.conversationSid
                }
            });
        }
    });

    conversationClient.removeAllListeners(connectionStateChangedEvent);
    conversationClient.addListener(connectionStateChangedEvent, (connectionStatus: string) => {
        if (connectionStatus === "connected") {
            dispatch(removeNotification(notifications.noConnectionNotification().id));
        } else if (connectionStatus === "connecting") {
            dispatch(addNotification(notifications.noConnectionNotification()));
        }
    });
};
