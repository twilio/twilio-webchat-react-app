import { Box } from "@twilio-paste/core/box";
import { ChatIcon } from "@twilio-paste/icons/esm/ChatIcon";
import { CloseIcon } from "@twilio-paste/icons/esm/CloseIcon";
import { useDispatch, useSelector } from "react-redux";

import { changeExpandedStatus } from "../store/actions/genericActions";
import { AppState } from "../store/definitions";
import { containerStyles } from "./styles/EntryPoint.styles";

export const EntryPoint = () => {
    const dispatch = useDispatch();
    const expanded = useSelector((state: AppState) => state.session.expanded);
    const hideChatBubble = useSelector((state: AppState) => state.config.hideChatBubble);

    if (hideChatBubble) return null;

    return (
        <Box
            as="button"
            data-test="entry-point-button"
            onClick={() => dispatch(changeExpandedStatus({ expanded: !expanded }))}
            {...containerStyles}
        >
            {expanded ? (
                <CloseIcon decorative={false} title="Minimize chat" size="sizeIcon60" />
            ) : (
                <ChatIcon decorative={false} title="Open chat" size="sizeIcon60" />
            )}
        </Box>
    );
};
