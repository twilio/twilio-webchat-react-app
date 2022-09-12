import { Box } from "@twilio-paste/core/box";
import { Text } from "@twilio-paste/core/text";
import { Button } from "@twilio-paste/core/button";
import { useDispatch, useSelector } from "react-redux";

import { sessionDataHandler } from "../sessionDataHandler";
import { changeEngagementPhase } from "../store/actions/genericActions";
import { EngagementPhase, AppState } from "../store/definitions";
import { containerStyles, textStyles, titleStyles } from "./styles/ConversationEnded.styles";

export const ConversationEnded = () => {
    const dispatch = useDispatch();
    const { messages, users } = useSelector((state: AppState) => ({
        messages: state.chat.messages,
        users: state.chat.users
    }));

    const handleStartNewChat = () => {
        sessionDataHandler.clear();
        dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
    };

    const doubleDigit = (number: number) => `${number < 10 ? 0 : ""}${number}`;

    const handleDownloadTranscript = () => {
        const transcriptData = [];
        if (messages && users) {
            for (const message of messages) {
                const currentUser = users.find((user) => user.identity === message.author);
                transcriptData.push({
                    author: message.author === "Concierge" ? message.author : currentUser?.friendlyName,
                    body: message.body,
                    timeStamp: message.dateCreated
                });
            }
        }
        const customerName = transcriptData[0].author;
        const conversationStartDate = transcriptData[0].timeStamp.toLocaleString("default", { dateStyle: "long" });
        let transcript = `Conversation with ${customerName}\n\nDate: ${conversationStartDate}\n\n`;
        for (const message of transcriptData) {
            const bulletPoint = message.author === customerName ? "*" : "+";
            const messageText = `${bulletPoint} ${doubleDigit(message.timeStamp.getHours())}:${doubleDigit(
                message.timeStamp.getMinutes()
            )}  ${message.author}: ${message.body}\n\n`;
            transcript = transcript.concat(messageText);
        }
    };

    return (
        <Box {...containerStyles}>
            <Text as="h3" {...titleStyles}>
                Thanks for chatting with us!
            </Text>
            <Text as="p" {...textStyles}>
                Do you want a transcript of our chat?
            </Text>
            <Button variant="secondary" data-test="download-transcript-button" onClick={handleDownloadTranscript}>
                Download transcript
            </Button>
            <Text as="p" {...textStyles}>
                If you have any more questions, feel free to reach out again.
            </Text>
            <Button variant="primary" data-test="start-new-chat-button" onClick={handleStartNewChat}>
                Start new chat
            </Button>
        </Box>
    );
};
