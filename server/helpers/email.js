const sgMail = require("@sendgrid/mail");
const axios = require("axios");

const { getTwilioClient } = require("./getTwilioClient");
const { getUniqueFilenames, getAgentNames, generateEmailTranscript, generateEmailContent } = require("./transcript");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const MCS_BASE_URL = "https://mcs.us1.twilio.com/v1";
const MEDIA_SID_PATTERN = /^ME[0-9a-fA-F]{32}$/;
const MAX_MEDIA_SIZE_IN_BYTES = 25 * 1024 * 1024;
const MEDIA_REQUEST_TIMEOUT_IN_MS = 30000;

class TranscriptRequestError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

const parseAttributes = (attributes) => {
    try {
        return JSON.parse(attributes || "{}");
    } catch {
        return {};
    }
};

const fetchConversation = async (conversationSid) => {
    try {
        return await getTwilioClient().conversations.conversations(conversationSid).fetch();
    } catch (error) {
        if (error.status === 404) {
            throw new TranscriptRequestError(404, "Conversation not found");
        }
        throw error;
    }
};

const assertRecipientIsInConversation = (preEngagementData, recipientAddress) => {
    const conversationEmail = preEngagementData?.email;
    if (typeof conversationEmail !== "string" || conversationEmail.toLowerCase() !== recipientAddress.toLowerCase()) {
        throw new TranscriptRequestError(403, "Recipient is not part of the conversation");
    }
};

const fetchAuthorNames = async (chatServiceSid, authorIdentities) => {
    const usersContext = getTwilioClient().conversations.services(chatServiceSid);
    const authorNameEntries = await Promise.all(
        authorIdentities.map(async (identity) => {
            if (identity === "Concierge") {
                return [identity, identity];
            }
            try {
                const user = await usersContext.users(identity).fetch();
                return [identity, user.friendlyName || identity];
            } catch (error) {
                console.error(`Could not fetch user ${identity}, using identity as name`, error.message);
                return [identity, identity];
            }
        })
    );
    return Object.fromEntries(authorNameEntries);
};

const downloadMedia = async (chatServiceSid, mediaSid) => {
    if (!MEDIA_SID_PATTERN.test(mediaSid)) {
        throw new Error(`Invalid media SID: ${mediaSid}`);
    }
    const mediaResponse = await axios.get(`${MCS_BASE_URL}/Services/${chatServiceSid}/Media/${mediaSid}`, {
        auth: { username: process.env.API_KEY, password: process.env.API_SECRET },
        timeout: MEDIA_REQUEST_TIMEOUT_IN_MS
    });
    const contentResponse = await axios.get(mediaResponse.data.links.content_direct_temporary, {
        responseType: "arraybuffer",
        timeout: MEDIA_REQUEST_TIMEOUT_IN_MS,
        maxContentLength: MAX_MEDIA_SIZE_IN_BYTES
    });
    return Buffer.from(contentResponse.data, "binary").toString("base64");
};

const sendTranscriptEmail = async ({ conversationSid, recipientAddress, subject }) => {
    const conversation = await fetchConversation(conversationSid);
    const preEngagementData = parseAttributes(conversation.attributes).pre_engagement_data;
    assertRecipientIsInConversation(preEngagementData, recipientAddress);

    const messages = await getTwilioClient().conversations.conversations(conversationSid).messages.list();
    if (messages.length === 0) {
        throw new TranscriptRequestError(400, "Conversation has no messages");
    }

    const authorIdentities = Array.from(new Set(messages.map((message) => message.author)));
    const authorNames = await fetchAuthorNames(conversation.chatServiceSid, authorIdentities);

    const transcriptData = messages.map((message) => ({
        author: authorNames[message.author],
        body: message.body,
        timeStamp: new Date(message.dateCreated),
        media: (message.media || []).filter((media) => media.category !== "body")
    }));

    const customerName = preEngagementData.name || transcriptData[0].author?.trim();
    const agentNames = getAgentNames(customerName, transcriptData);
    const transcript = generateEmailTranscript(customerName, agentNames, transcriptData);
    const uniqueFilenames = getUniqueFilenames(transcriptData);
    const allMedia = transcriptData.flatMap((message) => message.media);

    const attachments = await Promise.all(
        allMedia.map(async (media, mediaIndex) => ({
            content: await downloadMedia(conversation.chatServiceSid, media.sid),
            filename: uniqueFilenames[mediaIndex],
            type: media.content_type,
            disposition: "attachment"
        }))
    );

    const resolvedRecipientAddress = preEngagementData.email;
    try {
        await sgMail.send({
            to: resolvedRecipientAddress,
            from: process.env.FROM_EMAIL,
            subject,
            html: generateEmailContent(customerName, transcript),
            attachments
        });
    } catch (error) {
        console.error(`Error sending transcript email to: ${resolvedRecipientAddress}`, error.response?.body || error);
        throw new TranscriptRequestError(500, "Failed to send transcript email");
    }
    return { message: `Transcript email sent to: ${resolvedRecipientAddress}` };
};

module.exports = { sendTranscriptEmail, TranscriptRequestError };
