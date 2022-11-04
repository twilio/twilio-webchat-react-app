import { Message, User } from "@twilio/conversations";
import { useState } from "react";
import log from "loglevel";
import { Box } from "@twilio-paste/core/box";
import { Flex } from "@twilio-paste/core/flex";
import { Text } from "@twilio-paste/core/text";
import { Button } from "@twilio-paste/core/button";
import { Spinner } from "@twilio-paste/core/spinner";
import slugify from "slugify";
import JSZip from "jszip";
import saveAs from "file-saver";

import { contactBackend } from "../sessionDataHandler";
import { textStyles } from "./styles/ConversationEnded.styles";
import { buttonStyles, progressStyles } from "./styles/Transcript.styles";
import {
    getTranscriptData,
    getAgentNames,
    generateDownloadTranscript,
    getUniqueFilenames,
    generateEmailTranscript
} from "../utils/generateTranscripts";
import { TranscriptConfig } from "../definitions";
import { PreEngagementData } from "../store/definitions";

interface TranscriptProps {
    messages: Message[] | undefined;
    users: User[] | undefined;
    preEngagementData: PreEngagementData;
    transcriptConfig: TranscriptConfig | undefined;
}

export const Transcript = (props: TranscriptProps) => {
    const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false);
    const [isDownloadingTranscript, setIsDownloadingTranscript] = useState(false);
    const [isEmailingTranscript, setEmailingTranscript] = useState(false);

    const getMediaInfo = async () => {
        const mediaMessages = props.messages?.filter((message) => message.attachedMedia);
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
        setIsDownloadingTranscript(true);
        setIsGeneratingTranscript(true);
        const transcriptData = getTranscriptData(props.messages, props.users);
        const customerName = props.preEngagementData?.name || transcriptData[0].author?.trim();
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
        setIsGeneratingTranscript(false);
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
            await zip
                .generateAsync({ type: "blob" })
                .then((blob) => saveAs(blob, `${fileName}.zip`))
                .catch((e) => log.error(`Failed zipping message attachments: ${e}`));
        } else {
            saveAs(transcriptBlob, `${fileName}.txt`);
        }

        setTimeout(() => setIsDownloadingTranscript(false), 1000);
    };

    const handleEmailTranscript = async () => {
        setEmailingTranscript(true);
        setIsGeneratingTranscript(true);
        if (props.preEngagementData) {
            const transcriptData = getTranscriptData(props.messages, props.users);
            const uniqueFilenames = getUniqueFilenames(transcriptData);
            const customerName = props.preEngagementData?.name || transcriptData[0].author?.trim();
            const agentNames = getAgentNames(customerName, transcriptData);
            const mediaInfo = await getMediaInfo();
            const transcript = generateEmailTranscript(customerName, agentNames, transcriptData);
            setIsGeneratingTranscript(false);
            await contactBackend("/email", {
                recipientAddress: props.preEngagementData.email,
                subject: props.transcriptConfig?.emailSubject?.(agentNames),
                text: props.transcriptConfig?.emailContent?.(customerName, transcript),
                mediaInfo,
                uniqueFilenames
            });
        }
        setTimeout(() => setEmailingTranscript(false), 1000);
    };

    const renderDownloadingButton = () => {
        return (
            <Button variant="secondary" data-test="download-transcript-button" onClick={handleDownloadTranscript}>
                {isDownloadingTranscript ? (
                    <Box {...buttonStyles}>
                        <Spinner title="Loading" decorative={false} />
                        <Box {...progressStyles}>
                            <Text as="span" fontSize="fontSize20" lineHeight="lineHeight10">
                                {" "}
                                Download
                            </Text>
                            {isGeneratingTranscript ? (
                                <Text
                                    as="span"
                                    fontSize="fontSize10"
                                    fontWeight="fontWeightLight"
                                    color="colorTextWeak"
                                >
                                    Generating transcript...
                                </Text>
                            ) : (
                                <Text
                                    as="span"
                                    fontSize="fontSize10"
                                    fontWeight="fontWeightLight"
                                    color="colorTextWeak"
                                >
                                    Downloading transcript...
                                </Text>
                            )}
                        </Box>
                    </Box>
                ) : (
                    <span>Download</span>
                )}
            </Button>
        );
    };

    const renderEmailButton = () => {
        return (
            <Box marginLeft="space40">
                <Button variant="secondary" data-test="email-transcript-button" onClick={handleEmailTranscript}>
                    {isEmailingTranscript ? (
                        <Box {...buttonStyles}>
                            <Spinner title="Loading" decorative={false} />
                            <Box {...progressStyles}>
                                <Text as="span" fontSize="fontSize20" lineHeight="lineHeight10">
                                    {" "}
                                    Send to my email
                                </Text>
                                {isGeneratingTranscript ? (
                                    <Text
                                        as="span"
                                        fontSize="fontSize10"
                                        fontWeight="fontWeightLight"
                                        color="colorTextWeak"
                                    >
                                        Generating transcript...
                                    </Text>
                                ) : (
                                    <Text
                                        as="span"
                                        fontSize="fontSize10"
                                        fontWeight="fontWeightLight"
                                        color="colorTextWeak"
                                    >
                                        Sending transcript...
                                    </Text>
                                )}
                            </Box>
                        </Box>
                    ) : (
                        <span>Send to my email</span>
                    )}
                </Button>
            </Box>
        );
    };

    return (
        <>
            <Text as="p" {...textStyles}>
                Do you want a transcript of our chat?
            </Text>
            <Flex>
                {process.env.DOWNLOAD_TRANSCRIPT_ENABLED === "true" &&
                    !isEmailingTranscript &&
                    renderDownloadingButton()}
                {process.env.EMAIL_TRANSCRIPT_ENABLED === "true" && !isDownloadingTranscript && renderEmailButton()}
            </Flex>
        </>
    );
};
