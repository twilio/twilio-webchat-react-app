import { Box } from "@twilio-paste/core";
import { useDispatch } from "react-redux";
import { ReactNode } from "react";
import Modal from "react-modal";

import { useDevice } from "../hooks/useDevice";
import { changeExpandedStatus } from "../store/actions/genericActions";
import { innerContainerStyles } from "./styles/RootContainer.styles";

export const WrapperRoot = ({ children }: { children: ReactNode }) => {
    const dispatch = useDispatch();
    const { isMobile } = useDevice();
    const customStyles = {
        content: {
            width: "100%",
            height: "100%",
            padding: 0,
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)"
        }
    };

    if (isMobile) {
        return (
            <Modal
                isOpen={true}
                onRequestClose={() => dispatch(changeExpandedStatus({ expanded: false }))}
                style={customStyles}
                contentLabel="Example Modal"
            >
                <Box>{children}</Box>
            </Modal>
        );
    }

    return (
        <Box data-test="root-container" {...innerContainerStyles}>
            {children}
        </Box>
    );
};
