import log from "loglevel";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Box } from "@twilio-paste/core/box";
import { Text } from "@twilio-paste/core/text";
import { Button } from "@twilio-paste/core/button";
import { useDispatch, useSelector } from "react-redux";
import { Media, Message, User } from "@twilio/conversations";

import { sessionDataHandler } from "../sessionDataHandler";
import { changeEngagementPhase } from "../store/actions/genericActions";
import { EngagementPhase, AppState } from "../store/definitions";
import { containerStyles, textStyles, titleStyles } from "./styles/ConversationEnded.styles";
import { generateDuration } from "../utils/generateDuration";

export interface Transcript {
    author?: string;
    body: string;
    timeStamp: Date;
    attachedMedia?: Media[] | null;
}

export const getTranscriptData = (messages: Message[] | undefined, users: User[] | undefined): Transcript[] => {
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

export const generateTranscript = (transcriptData: Transcript[]) => {
    const doubleDigit = (number: number) => `${number < 10 ? 0 : ""}${number}`;
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

    const getMediaUrls = async () => {
        const mediaMessages = messages?.filter((message) => message.attachedMedia);
        console.log("mediaMessages", mediaMessages)
        const mediaURLs = [];
        if (mediaMessages) {
            for (const message of mediaMessages) {
                if (message.attachedMedia) {
                    for (const media of message.attachedMedia) {
                        try {
                            const file = {
                                name: media.filename,
                                type: media.contentType,
                                size: media.size
                            } as File;
                            const url = media ? await media.getContentTemporaryUrl() : URL.createObjectURL(file);
                            mediaURLs.push([url, media.filename]);
                        } catch (e) {
                            log.error(`Failed downloading message attachment: ${e}`);
                        }
                    }
                }
            }
        }
        return mediaURLs;
    };

    const handleDownloadTranscript = async () => {
        const transcriptData = getTranscriptData(messages, users);
        const transcript = generateTranscript(transcriptData);
        const transcriptBlob = new Blob([transcript], { type: "text/plain" });
        // const transcriptURL = URL.createObjectURL(transcriptBlob);
        const mediaURLs = await getMediaUrls();
        console.log(mediaURLs);

        if (mediaURLs.length > 0) {
            const zip = new JSZip();
            const folder = zip.folder("transcript");
            folder?.file("transcript.txt", transcriptBlob);
            mediaURLs.forEach((url) => {
                const blobPromise = fetch(url[0]).then(async (response) => {
                    if (response.status === 200) return response.blob();
                    return Promise.reject(new Error(response.statusText));
                });
                folder?.file(url[1], blobPromise);
            });

            zip.generateAsync({ type: "blob" })
                .then((blob) => saveAs(blob, "transcript.zip"))
                .catch((e) => console.log(e));
        } else {
            saveAs(transcriptBlob, "transcript.txt");
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
