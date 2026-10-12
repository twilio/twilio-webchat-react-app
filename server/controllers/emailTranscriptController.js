const { sendTranscriptEmail, TranscriptRequestError } = require("../helpers/email");

const EMAIL_TYPE_TRANSCRIPT = "transcript";
const CONVERSATION_SID_PATTERN = /^CH[0-9a-fA-F]{32}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmailParams = (body) => {
    const { type, conversationSid, recipientAddress, subject } = body || {};

    if (type !== EMAIL_TYPE_TRANSCRIPT) {
        throw new TranscriptRequestError(400, "Invalid type");
    }

    if (typeof conversationSid !== "string" || !CONVERSATION_SID_PATTERN.test(conversationSid)) {
        throw new TranscriptRequestError(400, "Invalid conversationSid");
    }

    if (typeof recipientAddress !== "string" || !EMAIL_PATTERN.test(recipientAddress)) {
        throw new TranscriptRequestError(400, "Invalid recipientAddress");
    }

    if (!subject || typeof subject !== "string") {
        throw new TranscriptRequestError(400, "Invalid subject");
    }

    return { conversationSid, recipientAddress, subject };
};

const emailTranscriptController = async (req, res) => {
    try {
        const validatedParams = validateEmailParams(req.body);
        const result = await sendTranscriptEmail(validatedParams);
        res.json(result);
    } catch (err) {
        console.error("Email transcript error:", err.message);
        if (err instanceof TranscriptRequestError) {
            res.status(err.statusCode).json({ error: err.message });
            return;
        }
        res.status(500).json({ error: "Failed to send transcript email" });
    }
};

module.exports = { emailTranscriptController };
