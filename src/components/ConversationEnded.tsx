import { Box } from "@twilio-paste/core/box";
import { Text } from "@twilio-paste/core/text";
import { Button } from "@twilio-paste/core/button";
import { useDispatch, useSelector } from "react-redux";

import { sessionDataHandler } from "../sessionDataHandler";
import { changeEngagementPhase, updatePreEngagementData } from "../store/actions/genericActions";
import { EngagementPhase, AppState } from "../store/definitions";
import { containerStyles, textStyles, titleStyles } from "./styles/ConversationEnded.styles";
import { Transcript } from "./Transcript";

export const ConversationEnded = () => {
    const dispatch = useDispatch();
    const { messages, users, preEngagementData, transcriptConfig } = useSelector((state: AppState) => ({
        messages: state.chat.messages,
        users: state.chat.users,
        preEngagementData: state.chat.conversation?.attributes.pre_engagement_data,
        transcriptConfig: state.config.transcript
    }));

    const handleStartNewChat = () => {
        sessionDataHandler.clear();
        dispatch(updatePreEngagementData({ email: "", name: "", query: "" }));
        dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
    };

    return (
        <Box {...containerStyles}>
            <Text as="h3" {...titleStyles}>
                Thanks for chatting with us!
            </Text>
            <Transcript
                messages={messages}
                preEngagementData={preEngagementData}
                users={users}
                transcriptConfig={transcriptConfig}
            />
            <Text as="p" {...textStyles}>
                If you have any more questions, feel free to reach out again.
            </Text>
            <Button variant="primary" data-test="start-new-chat-button" onClick={handleStartNewChat}>
                Start new chat
            </Button>
        </Box>
    );
};
