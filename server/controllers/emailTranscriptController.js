const { sendMessage } = require("../helpers/email");

const emailTranscriptController = async (req, res) => {
        try {
            const message = await sendMessage(req.body);
            res.json(message);
        } catch (err) {
            console.error(err);
        }
    };

module.exports = { emailTranscriptController };
