import { createNewWebchat } from "./createNewWebchat";
import {
    addAttachmentFileAndSend,
    addAttachmentFile,
    validateLastAttachmentMessage,
    validateLastTextMessage
} from "./addAttachmentFileAndSend";
import { storeWebchatSessionCookie, resumeWebchatSessionCookie, getConversationSid } from "./webchatSessionCookie";

Cypress.Commands.add("createNewWebchat", createNewWebchat);
Cypress.Commands.add("addAttachmentFileAndSend", addAttachmentFileAndSend);
Cypress.Commands.add("addAttachmentFile", addAttachmentFile);
Cypress.Commands.add("validateLastTextMessage", validateLastTextMessage);
Cypress.Commands.add("validateLastAttachmentMessage", validateLastAttachmentMessage);
Cypress.Commands.add("getConversationSid", getConversationSid);
Cypress.Commands.add("storeWebchatSessionCookie", storeWebchatSessionCookie);
Cypress.Commands.add("resumeWebchatSessionCookie", resumeWebchatSessionCookie);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            createNewWebchat: typeof createNewWebchat;
            addAttachmentFileAndSend: typeof addAttachmentFileAndSend;
            addAttachmentFile: typeof addAttachmentFile;
            validateLastTextMessage: typeof validateLastTextMessage;
            validateLastAttachmentMessage: typeof validateLastAttachmentMessage;
            storeWebchatSessionCookie: typeof storeWebchatSessionCookie;
            resumeWebchatSessionCookie: typeof resumeWebchatSessionCookie;
            getConversationSid: () => Chainable<ReturnType<typeof getConversationSid>>;
        }
    }
}
