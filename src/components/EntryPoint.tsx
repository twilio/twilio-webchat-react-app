import { Box } from "@twilio-paste/core/box";
import { ChevronDownIcon } from "@twilio-paste/icons/esm/ChevronDownIcon";
import { useDispatch, useSelector } from "react-redux";

import { changeExpandedStatus } from "../store/actions/genericActions";
import { AppState } from "../store/definitions";
import { containerStyles } from "./styles/EntryPoint.styles";
import "./styles/EntryPoint.css";

export const EntryPoint = () => {
    const dispatch = useDispatch();
    const expanded = useSelector((state: AppState) => state.session.expanded);

    return (
        <Box
            as="button"
            data-test="entry-point-button"
            onClick={() => dispatch(changeExpandedStatus({ expanded: !expanded }))}
            {...containerStyles}
            className="chat-button"
        >
            {expanded ? (
                <ChevronDownIcon decorative={false} title="Minimize chat" size="sizeIcon80" />
            ) : (
                <div className="chat-icon-container">
                    <img className="chat-icon" alt="chat-icon" />
                    <span className="chat-icon-text" />
                </div>
            )}
        </Box>
    );
};
