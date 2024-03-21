import { Text } from "@twilio-paste/core/text";
import { Alert } from "@twilio-paste/core/alert";
import { Tooltip } from "@twilio-paste/core/tooltip";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { Notification } from "../store/definitions";
import { removeNotification } from "../store/actions/genericActions";

export const NotificationBarItem = ({
    dismissible,
    id,
    message,
    onDismiss,
    timeout,
    type,
    filename,
    originalFileName,
    showTooltip
}: Notification) => {
    const dispatch = useDispatch();

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (timeout) {
            timer = setTimeout(() => {
                dispatch(removeNotification(id));
                if (onDismiss) {
                    onDismiss();
                }
            }, timeout);
        }
        return () => {
            clearTimeout(timer);
        };
    }, [dispatch, timeout, id, onDismiss]);

    const dismissNotification = () => {
        if (onDismiss) {
            onDismiss();
        }
        dispatch(removeNotification(id));
    };

    return (
        <Alert
            role="status"
            aria-live="polite"
            variant={type}
            onDismiss={dismissible ? dismissNotification : undefined}
            data-test="alert-message"
        >
            <Text data-test="alert-message-text" as="span">
                {showTooltip ? (
                    <Tooltip data-testid="fileTooltip" placement="left" unstable_preventOverflow={true} text={originalFileName ?? ""}>
                        <Text as="span" data-testid="filename">{filename}</Text>
                    </Tooltip>
                ) : (
                    <Text as="span">{filename}</Text>
                )}
                {message}
            </Text>
        </Alert>
    );
};
