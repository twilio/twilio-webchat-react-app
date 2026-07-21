const { sendMessage } = require("../helpers/email");

const validateEmailParams = (body) => {
    const { recipientAddress, subject, text, mediaInfo, uniqueFilenames } = body;

    if (!recipientAddress || typeof recipientAddress !== "string") {
        throw new Error("Invalid recipientAddress");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientAddress)) {
        throw new Error("Invalid email format");
    }

    if (!subject || typeof subject !== "string" || subject.length > 200) {
        throw new Error("Invalid subject");
    }

    if (!Array.isArray(mediaInfo)) {
        throw new Error("mediaInfo must be an array");
    }

    if (!Array.isArray(uniqueFilenames)) {
        throw new Error("uniqueFilenames must be an array");
    }

    if (mediaInfo.length !== uniqueFilenames.length) {
        throw new Error("mediaInfo and uniqueFilenames length mismatch");
    }

    if (mediaInfo.length > 10) {
        throw new Error("Too many attachments (max 10)");
    }

    return { recipientAddress, subject, text, mediaInfo, uniqueFilenames };
};

const emailTranscriptController = async (req, res) => {
    try {
        const validatedParams = validateEmailParams(req.body);
        const message = await sendMessage(validatedParams);
        res.json(message);
    } catch (err) {
        console.error("Email transcript error:", err.message);
        res.status(400).json({ error: err.message });
    }
};

module.exports = { emailTranscriptController };
