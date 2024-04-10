// Imports global types
import "@twilio-labs/serverless-runtime-types";
import axios from "axios";
import sgMail, { MailDataRequired } from "@sendgrid/mail";
// Fetches specific types
import { Context, ServerlessCallback, ServerlessFunctionSignature } from "@twilio-labs/serverless-runtime-types/types";

type EmailTranscriptEvent = {
    body?: any;
};

// If you want to use environment variables, you will need to type them like
// this and add them to the Context in the function signature
type FunctionContext = {
    ADDRESS_SID?: string;
    ACCOUNT_SID?: string;
    AUTH_TOKEN?: string;
    API_KEY?: string;
    API_SECRET?: string;
    CONVERSATIONS_SERVICE_SID?: string;
    FROM_EMAIL?: string;
};

function createMessage(emailData: any, files: any, context: Context<FunctionContext>) {
    const attachmentObjects = files.map((file: any) => ({
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

async function sendMessage(emailParams: any, context: Context<FunctionContext>) {
    const uniqueFilenames = emailParams.uniqueFilenames;
    const getMedia = emailParams.mediaInfo.map((media: any) => axios.get(media.url, { responseType: "arraybuffer" }));
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
        const createdMessage = createMessage(emailParams, files, context);
        await sgMail.send(createdMessage as MailDataRequired);
        return { message: `Transcript email sent to: ${emailParams.recipientAddress}` };
    } catch (error: any) {
        console.error(`Error sending transcript email to: ${emailParams.recipientAddress}`, error);
        if (error.response) {
            console.error(error.response.body);
        }
        return { message: "error" };
    }
}

export const handler: ServerlessFunctionSignature = async function (
    context: Context<FunctionContext>,
    event: EmailTranscriptEvent,
    callback: ServerlessCallback
) {
    const response = new Twilio.Response();

    response.appendHeader("Access-Control-Allow-Origin", "*");
    response.appendHeader("Access-Control-Allow-Methods", "OPTIONS POST GET");
    response.appendHeader("Content-Type", "application/json");
    response.appendHeader("Access-Control-Allow-Headers", "Content-Type");

    try {
        const message = await sendMessage(event.body, context);
        response.setBody({ message });
    } catch (error: any) {
        console.error(error);
        response.setStatusCode(500);
        response.setBody({ error: `Invalid token provided: ${error.message}` });
        return callback(null, response);
    }

    response.setStatusCode(200);
    callback(null, response);
};
