const sgMail = require("@sendgrid/mail");
const axios = require("axios");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function createMessage(emailData, files) {
    const attachmentObjects = files.map((file) => ({
        content: file.file,
        filename: file.filename,
        type: file.type,
        disposition: "attachment"
    }));
    return {
        to: emailData.recipientAddress,
        from: process.env.FROM_EMAIL,
        subject: emailData.subject,
        html: emailData.text,
        attachments: attachmentObjects
    };
}

async function sendMessage(emailParams) {
    const uniqueFilenames = emailParams.uniqueFilenames;
    const getMedia = emailParams.mediaInfo.map((media) => axios.get(media.url, { responseType: "arraybuffer" }));
    const files = await Promise.all(getMedia).then((responses) => {
        const files = [];
        for (let i = 0; i < responses.length; i++) {
            try {
                const response = responses[i];
                const base64File = Buffer.from(response.data, "binary").toString("base64");
                files.push({ file: base64File, filename: uniqueFilenames[i], type: emailParams.mediaInfo[i].type });
            } catch (error) {
                console.error(error);
            }
        }
        return files;
    });

    try {
        await sgMail.send(createMessage(emailParams, files));
        return { message: `Transcript email sent to: ${emailParams.recipientAddress}` };
    } catch (error) {
        console.error(`Error sending transcript email to: ${emailParams.recipientAddress}`, error);
        if (error.response) {
            console.error(error.response.body);
        }
        return { message };
    }
}

module.exports = {
    sendMessage
};
