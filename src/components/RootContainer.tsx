import { Box } from "@twilio-paste/core/box";
import { useSelector } from "react-redux";

import { MessagingCanvasPhase } from "./MessagingCanvasPhase";
import { AppState, EngagementPhase } from "../store/definitions";
import { PreEngagementFormPhase } from "./PreEngagementFormPhase";
import { LoadingPhase } from "./LoadingPhase";
import { EntryPoint } from "./EntryPoint";
import { outerContainerStyles } from "./styles/RootContainer.styles";
import { WrapperRoot } from "./WrapperRoot";

const getPhaseComponent = (phase: EngagementPhase) => {
    switch (phase) {
        case EngagementPhase.Loading:
            return <LoadingPhase />;
        case EngagementPhase.MessagingCanvas:
            return <MessagingCanvasPhase />;
        case EngagementPhase.PreEngagementForm:
        default:
            return <PreEngagementFormPhase />;
    }
};

export function RootContainer() {
    const { currentPhase, expanded } = useSelector(({ session }: AppState) => ({
        currentPhase: session.currentPhase,
        expanded: session.expanded
    }));

    return (
        <Box>
            <Box {...outerContainerStyles}>
                {expanded && (
                    <WrapperRoot>
                        <>{getPhaseComponent(currentPhase)}</>
                    </WrapperRoot>
                )}
                <EntryPoint />
            </Box>
        </Box>
    );
}
