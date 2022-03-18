const LOCAL_STORAGE_ITEM_ID = "TWILIO_WEBCHAT_WIDGET";
let webchatSessionCookie;
const error = `It looks like you're trying to restore a webchat session, but there isn't one.

Make sure to run a test that creates a session and stores it using the "storeWebchatSessionCookie" command.`;

export const storeWebchatSessionCookie = () => {
    webchatSessionCookie = localStorage.getItem(LOCAL_STORAGE_ITEM_ID);
    if (!webchatSessionCookie) {
        throw Error("No conversation cookie found");
    }
    return webchatSessionCookie;
};

export const resumeWebchatSessionCookie = () => {
    if (!webchatSessionCookie) {
        throw Error(error);
    }
    localStorage.setItem(LOCAL_STORAGE_ITEM_ID, webchatSessionCookie);

    return cy.reload();
};

export const getConversationSid = () => {
    if (!webchatSessionCookie) {
        throw Error(error);
    }
    return JSON.parse(webchatSessionCookie).conversationSid;
};
