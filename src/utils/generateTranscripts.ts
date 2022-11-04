import { Media, Message, User } from "@twilio/conversations";

import { generateDuration } from "./generateDuration";

interface Transcript {
    author?: string;
    body: string;
    timeStamp: Date;
    attachedMedia?: Media[] | null;
}

const getTranscriptData = (messages: Message[] | undefined, users: User[] | undefined): Transcript[] => {
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

const getAgentNames = (customerName: string | undefined, transcriptData: Transcript[]) => {
    const names = transcriptData.map((message) => message.author);
    let agentNames = Array.from(
        new Set(names.filter((name) => name?.trim() !== customerName && name?.trim() !== "Concierge"))
    );
    agentNames = agentNames.map((name) => name?.trim());
    return agentNames;
};

const getUniqueFilenames = (transcriptData: Transcript[]) => {
    const mediaMessages = transcriptData.filter((message) => message.attachedMedia);
    const filenames = [];
    for (const message of mediaMessages || []) {
        for (const media of message.attachedMedia || []) {
            filenames.push(media.filename);
        }
    }
    interface seenFilenamesInfo {
        [key: string]: number;
    }
    const seenFilenames: seenFilenamesInfo = {};
    const uniqueFilenames = [];
    for (const filename of filenames) {
        if (Object.keys(seenFilenames).includes(filename)) {
            const fileExtension = filename.split(".").pop() || "";
            let filenameStart = filename.split(fileExtension)[0].slice(0, -1);
            filenameStart = `${filenameStart}-${seenFilenames[filename]}`;
            uniqueFilenames.push(`${filenameStart}.${fileExtension}`);
            seenFilenames[filename] += 1;
        } else {
            seenFilenames[filename] = 1;
            uniqueFilenames.push(filename);
        }
    }
    return uniqueFilenames;
};

const generateDownloadTranscript = (
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
            for (let i = 0; i < message.attachedMedia.length; i++) {
                messageText = messageText.concat(` (** Attached file ${uniqueFilenames[mediaMessageIndex + i]} **)`);
            }
            mediaMessageIndex += message.attachedMedia.length;
        }
        transcript = transcript.concat(`${messageText}\n\n`);
    }
    return transcript;
};

const generateEmailTranscript = (
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
            for (let i = 0; i < message.attachedMedia.length; i++) {
                messageText = messageText.concat(
                    ` (** Attached file <i>${uniqueFilenames[mediaMessageIndex + i]}</i> **)`
                );
            }
            mediaMessageIndex += message.attachedMedia.length;
        }
        transcript = transcript.concat(`${messageText}<br><br>`);
    }
    return transcript;
};

// eslint-disable-next-line import/no-unused-modules
export type { Transcript };
// eslint-disable-next-line import/no-unused-modules
export { getTranscriptData, getAgentNames, generateDownloadTranscript, generateEmailTranscript, getUniqueFilenames };
