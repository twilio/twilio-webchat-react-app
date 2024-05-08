import { WebChatClient } from "@twilio/webchat";
import { Dispatch } from "redux";
import log from "loglevel";

import { sessionDataHandler } from "../../../sessionDataHandler";
import { notifications } from "../../../notifications";
import { addNotification, removeNotification } from "../genericActions";
import { ACTION_UPDATE_SESSION_DATA } from "../actionTypes";

export const initClientListeners = (webchatClient: WebChatClient, dispatch: Dispatch) => {
    // remove any other refresh handler added before and add it again
    webchatClient.removeAllListeners(WebChatClient.tokenAboutToExpire);
    webchatClient.onWithReplay(WebChatClient.tokenAboutToExpire, async () => {
        log.debug("webchatClientListener: token about to expire");

        const data = await sessionDataHandler.getUpdatedToken();
        if (data?.token && data?.conversationSid) { // @fixme: cannot update conversationSid mid-run
            await webchatClient.updateToken(data.token);
            dispatch({
                type: ACTION_UPDATE_SESSION_DATA,
                payload: {
                    token: data.token,
                    conversationSid: data.conversationSid
                }
            });
        }
    });

    webchatClient.removeAllListeners(WebChatClient.connectionStateChanged);
    webchatClient.addListener(WebChatClient.connectionStateChanged, (connectionStatus: string) => {
        if (connectionStatus === "connected") {
            dispatch(removeNotification(notifications.noConnectionNotification().id));
        } else if (connectionStatus === "connecting") {
            dispatch(addNotification(notifications.noConnectionNotification()));
        }
    });
};
