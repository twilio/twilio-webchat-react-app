import log from "loglevel";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Box } from "@twilio-paste/core/box";
import { Flex } from "@twilio-paste/core/flex";
import { Text } from "@twilio-paste/core/text";
import { Button } from "@twilio-paste/core/button";
import { useDispatch, useSelector } from "react-redux";
import { Media, Message, User } from "@twilio/conversations";
import { useState } from "react";
import slugify from "slugify";

import { sessionDataHandler, contactBackend } from "../sessionDataHandler";
import { changeEngagementPhase, updatePreEngagementData } from "../store/actions/genericActions";
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

export const getAgentNames = (customerName: string | undefined, transcriptData: Transcript[]) => {
    const names = transcriptData.map((message) => message.author);
    let agentNames = Array.from(
        new Set(names.filter((name) => name?.trim() !== customerName && name?.trim() !== "Concierge"))
    );
    agentNames = agentNames.map((name) => name?.trim());
    return agentNames;
};

const getUniqueFilenames = (transcriptData: Transcript[]) => {
    const mediaMessages = transcriptData.filter((message) => message.attachedMedia);
    const filenames = mediaMessages.map((message) => {
        if (message.attachedMedia) {
            return message.attachedMedia[0].filename;
        }
        return "";
    });
    interface seenFilenamesInfo {
        [key: string]: number;
    }
    const seenFilenames: seenFilenamesInfo = {};
    const uniqueFilenames = [];
    for (const filename of filenames) {
        if (Object.keys(seenFilenames).includes(filename)) {
            const filenameParts = filename.split(".");
            filenameParts[0] = `${filenameParts[0]}-${seenFilenames[filename]}`;
            uniqueFilenames.push(filenameParts.join("."));
            seenFilenames[filename] += 1;
        } else {
            seenFilenames[filename] = 1;
            uniqueFilenames.push(filename);
        }
    }
    return uniqueFilenames;
};

export const generateDownloadTranscript = (
    customerName: string | undefined,
    agentNames: (string | undefined)[],
    transcriptData: Transcript[]
) => {
    const doubleDigit = (number: number) => `${number < 10 ? 0 : ""}${number}`;
    const conversationStartDate = transcriptData[0].timeStamp.toLocaleString("default", { dateStyle: "long" });
    const duration = generateDuration(transcriptData);
    const uniqueFilenames = getUniqueFilenames(transcriptData);
    let mediaMessageIndex = 0;
    let conversationTitle = `Conversation with ${customerName}`;
    if (agentNames.length > 0) {
        agentNames.forEach((name) => (conversationTitle = conversationTitle.concat(` and ${name}`)));
    }
    let transcript = `${conversationTitle}\n\nDate: ${conversationStartDate}\nDuration: ${duration}\n\n`;
    for (const message of transcriptData) {
        const bulletPoint = message.author === customerName ? "*" : "+";
        let messageText = `${bulletPoint} ${doubleDigit(message.timeStamp.getHours())}:${doubleDigit(
            message.timeStamp.getMinutes()
        )}  ${message.author}: ${message.body}`;
        if (message.attachedMedia) {
            messageText = messageText.concat(` (** Attached file ${uniqueFilenames[mediaMessageIndex]} **)`);
            mediaMessageIndex += 1;
        }
        transcript = transcript.concat(`${messageText}\n\n`);
    }
    return transcript;
};

export const generateEmailTranscript = (
    customerName: string | undefined,
    agentNames: (string | undefined)[],
    transcriptData: Transcript[]
) => {
    const doubleDigit = (number: number) => `${number < 10 ? 0 : ""}${number}`;
    const conversationStartDate = transcriptData[0].timeStamp.toLocaleString("default", { dateStyle: "long" });
    const duration = generateDuration(transcriptData);
    const uniqueFilenames = getUniqueFilenames(transcriptData);
    let mediaMessageIndex = 0;

    let conversationTitle = `Chat with <strong>${customerName}</strong>`;
    if (agentNames.length > 0) {
        agentNames.forEach((name) => (conversationTitle = conversationTitle.concat(` and <strong>${name}</strong>`)));
    }

    let transcript = `${conversationTitle}<br><br><strong>Date:</strong> ${conversationStartDate}<br><strong>Duration:</strong> ${duration}<br><br>`;
    for (const message of transcriptData) {
        let messageText = `${doubleDigit(message.timeStamp.getHours())}:${doubleDigit(
            message.timeStamp.getMinutes()
        )} <i>${message.author}</i>: ${message.body}`;
        if (message.attachedMedia) {
            messageText = messageText.concat(` (** Attached file <i>${uniqueFilenames[mediaMessageIndex]}</i> **)`);
            mediaMessageIndex += 1;
        }
        transcript = transcript.concat(`${messageText}<br><br>`);
    }
    return transcript;
};

export const ConversationEnded = () => {
    const dispatch = useDispatch();
    const { messages, users, preEngagementData, transcriptConfig } = useSelector((state: AppState) => ({
        messages: state.chat.messages,
        users: state.chat.users,
        preEngagementData: state.chat.conversation?.attributes.pre_engagement_data,
        transcriptConfig: state.config.transcript
    }));

    const [downloadingTranscript, setdownloadingTranscript] = useState(false);
    const [emailingTranscript, setEmailingTranscript] = useState(false);

    const handleStartNewChat = () => {
        sessionDataHandler.clear();
        dispatch(updatePreEngagementData({ email: "", name: "", query: "" }));
        dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
    };

    const getMediaInfo = async () => {
        const mediaMessages = messages?.filter((message) => message.attachedMedia);
        const mediaInfo = [];
        for (const message of mediaMessages || []) {
            for (const media of message.attachedMedia || []) {
                try {
                    const file = {
                        name: media.filename,
                        type: media.contentType,
                        size: media.size
                    } as File;
                    const url = media ? await media.getContentTemporaryUrl() : URL.createObjectURL(file);
                    mediaInfo.push({ url, filename: media.filename, type: media.contentType });
                } catch (e) {
                    log.error(`Failed downloading message attachment: ${e}`);
                }
            }
        }
        return mediaInfo;
    };

    const handleDownloadTranscript = async () => {
        setdownloadingTranscript(true);
        const transcriptData = getTranscriptData(messages, users);
        const customerName = preEngagementData?.name || transcriptData[0].author?.trim();
        const agentNames = getAgentNames(customerName, transcriptData);
        const transcript = generateDownloadTranscript(customerName, agentNames, transcriptData);
        const transcriptBlob = new Blob([transcript], { type: "text/plain" });
        const mediaInfo = await getMediaInfo();

        let fileName = `chat-with-${customerName}`;
        if (agentNames.length > 0) {
            agentNames.forEach((name) => (fileName = fileName.concat(`-and-${name}`)));
        }
        fileName = fileName.concat(`-${slugify(transcriptData[0].timeStamp.toDateString())}`);
        fileName = fileName.toLowerCase();

        if (mediaInfo.length > 0) {
            const uniqueFilenames = getUniqueFilenames(transcriptData);
            let mediaMessageIndex = 0;
            const zip = new JSZip();
            const folder = zip.folder(fileName);
            folder?.file(`${fileName}.txt`, transcriptBlob);
            mediaInfo.forEach((info) => {
                const blobPromise = fetch(info.url).then(async (response) => {
                    if (response.status === 200) return response.blob();
                    return Promise.reject(new Error(response.statusText));
                });
                folder?.file(uniqueFilenames[mediaMessageIndex], blobPromise);
                mediaMessageIndex += 1;
            });

            zip.generateAsync({ type: "blob" })
                .then((blob) => saveAs(blob, `${fileName}.zip`))
                .catch((e) => log.error(`Failed zipping message attachments: ${e}`));
        } else {
            saveAs(transcriptBlob, `${fileName}.txt`);
        }
        setdownloadingTranscript(false);
    };

    const handleEmailTranscript = async () => {
        setEmailingTranscript(true);
        if (preEngagementData) {
            const transcriptData = getTranscriptData(messages, users);
            const uniqueFilenames = getUniqueFilenames(transcriptData);
            const customerName = preEngagementData?.name || transcriptData[0].author?.trim();
            const agentNames = getAgentNames(customerName, transcriptData);
            const mediaInfo = await getMediaInfo();
            const transcript = generateEmailTranscript(customerName, agentNames, transcriptData);
            await contactBackend("/email", {
                recipientAddress: preEngagementData.email,
                subject: transcriptConfig?.emailSubject?.(agentNames),
                text: transcriptConfig?.emailContent?.(customerName, transcript),
                mediaInfo,
                uniqueFilenames
            });
        }
        setEmailingTranscript(false);
    };

    return (
        <Box {...containerStyles}>
            <Text as="h3" {...titleStyles}>
                Thanks for chatting with us!
            </Text>
            {(transcriptConfig?.downloadEnabled || transcriptConfig?.emailEnabled) && (
                <>
                    <Text as="p" {...textStyles}>
                        Do you want a transcript of our chat?
                    </Text>
                    <Flex>
                        {transcriptConfig?.downloadEnabled && (
                            <Button
                                variant="secondary"
                                data-test="download-transcript-button"
                                onClick={handleDownloadTranscript}
                                loading={downloadingTranscript}
                            >
                                Download
                            </Button>
                        )}
                        {transcriptConfig?.emailEnabled && (
                            <Box marginLeft="space40">
                                <Button
                                    variant="secondary"
                                    data-test="email-transcript-button"
                                    onClick={handleEmailTranscript}
                                    loading={emailingTranscript}
                                >
                                    Send to my email
                                </Button>
                            </Box>
                        )}
                    </Flex>
                </>
            )}
            <Text as="p" {...textStyles}>
                If you have any more questions, feel free to reach out again.
            </Text>
            <Button variant="primary" data-test="start-new-chat-button" onClick={handleStartNewChat}>
                Start new chat
            </Button>
        </Box>
    );
};
