import { Box } from "@twilio-paste/core/box";
import { Text } from "@twilio-paste/core/text";
import { Button } from "@twilio-paste/core/button";
import { useDispatch, useSelector } from "react-redux";
import { Media } from "@twilio/conversations";

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

    interface Transcript {
        author?: string;
        body: string;
        timeStamp: Date;
        attachedMedia?: Media[] | null;
    }

    const doubleDigit = (number: number) => `${number < 10 ? 0 : ""}${number}`;

    const getTranscriptData = (): Transcript[] => {
        const transcriptData = [];
        if (messages && users) {
            for (const message of messages) {
                const currentUser = users.find((user) => user.identity === message.author);
                transcriptData.push({
                    author: message.author === "Concierge" ? message.author : currentUser?.friendlyName,
                    body: message.body,
                    timeStamp: message.dateCreated,
                    attachedMedia: message.attachedMedia
                });
            }
        }
        return transcriptData;
    };

    const generateDuration = (transcriptData: Transcript[]) => {
        let deltaInSeconds =
            (transcriptData[transcriptData.length - 1].timeStamp.getTime() - transcriptData[0].timeStamp.getTime()) /
            1000;

        const days = Math.floor(deltaInSeconds / (24 * 60 * 60));
        deltaInSeconds -= days * (24 * 60 * 60);
        const hours = Math.floor(deltaInSeconds / (60 * 60)) % 24;
        deltaInSeconds -= hours * (60 * 60);
        const minutes = Math.floor(deltaInSeconds / 60) % 60;
        deltaInSeconds -= minutes * 60;
        const seconds = Math.round(deltaInSeconds % 60);

        const displayedDays = days > 0 ? `${days} ${days === 1 ? "day" : "days"} ` : "";
        const displayedHours = hours > 0 ? `${hours} ${hours === 1 ? "hour" : "hours"} ` : "";
        const displayedSeconds = seconds > 0 ? `${seconds} ${seconds === 1 ? "second" : "seconds"} ` : "";

        return `${displayedDays}${displayedHours}${displayedSeconds}`;
    };

    const generateTranscript = (transcriptData: Transcript[]) => {
        const customerName = transcriptData[0].author;
        const conversationStartDate = transcriptData[0].timeStamp.toLocaleString("default", { dateStyle: "long" });
        const duration = generateDuration(transcriptData);

        let transcript = `Conversation with ${customerName}\n\nDate: ${conversationStartDate}\nDuration: ${duration}\n\n`;
        for (const message of transcriptData) {
            const bulletPoint = message.author === customerName ? "*" : "+";
            let messageText = `${bulletPoint} ${doubleDigit(message.timeStamp.getHours())}:${doubleDigit(
                message.timeStamp.getMinutes()
            )}  ${message.author}: ${message.body}`;
            if (message.attachedMedia) {
                messageText = messageText.concat(` (** Attached file ${message.attachedMedia[0].filename} **)`);
            }
            transcript = transcript.concat(`${messageText}\n\n`);
        }
        return transcript;
    };

    const handleDownloadTranscript = () => {
        const transcriptData = getTranscriptData();
        const transcript = generateTranscript(transcriptData);
        const transcriptBlob = new Blob([transcript], { type: "text/plain" });
        const transcriptURL = URL.createObjectURL(transcriptBlob);
        const hiddenLink = document.createElement("a");
        hiddenLink.download = "transcript.txt";
        hiddenLink.href = transcriptURL;
        hiddenLink.click();
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
