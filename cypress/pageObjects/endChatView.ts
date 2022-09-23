const EndChatView = {
    getStartNewChatButton(time) {
        return cy.get('[data-test="start-new-chat-button"]', { timeout: time });
    },

    getDownloadTranscriptButton(time) {
        return cy.get('[data-test="download-transcript-button"]', { timeout: time });
    },

    getEmailTranscriptButton(time) {
        return cy.get('[data-test="email-transcript-button"]', { timeout: time });
    },

    validateStartNewChatButtonVisible(time) {
        this.getStartNewChatButton(time).should("be.visible");
    },

    validateDownloadTranscriptButtonButtonVisible(time) {
        this.getDownloadTranscriptButton(time).should("be.visible");
    },

    validateEmailTranscriptButtonButtonVisible(time) {
        this.getEmailTranscriptButton(time).should("be.visible");
    },
    loop(gmailCredentials, timestamp: string): void {
        cy.task("getReceivedEmails", { ...gmailCredentials, count: 1 }).then((receivedEmails: any) => {
            // Find the email that the test sent
            const receivedEmail = receivedEmails.find((email) => {
                return email.internalDate < Number(timestamp) + 60000 && email.internalDate > Number(timestamp) - 60000;
            });
            // Check if the email is received
            if (!receivedEmail) {
                throw new Error("Didnt find the email in customers inbox!");
            }
            cy.task("log", "Found the email in customers inbox!");
            // Check email attachments
            const attachedParts = receivedEmail.payload.parts.filter((p: { mimeType: string }) => {
                return p.mimeType !== "text/html";
            });
            const attachedFiles = Array.from(new Set(attachedParts.map((p) => p.filename)));

            if (attachedFiles.length !== 5) {
                throw new Error(
                    `The sent email does not contain the correct amount of files! Amount of files found: ${attachedFiles.length}`
                );
            }
            cy.task("log", "Confirmed that the correct amount of files are attached to the email!");
        });
    }
};
export default EndChatView;
