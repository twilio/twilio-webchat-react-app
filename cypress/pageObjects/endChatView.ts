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
    loop(gmailCredentials, retries: number, timestamp: string): void {
        console.log("in loop...");
        console.log("loop gmailCredentials", gmailCredentials);
        cy.task("getReceivedEmails", { ...gmailCredentials, count: 1 }).then((receivedEmails: any) => {
            console.log("afterReceivedEmails");
            console.log("receivedEmails", receivedEmails);
            try {
                // Find the email that the test sent
                const receivedEmail = receivedEmails.find((email) => {
                    return (
                        email.internalDate < Number(timestamp) + 60000 && email.internalDate > Number(timestamp) - 60000
                    );
                });
                console.log("timestamp", timestamp);
                console.log("receivedEmail", receivedEmail);
                // Check if the email is received
                if (!receivedEmail) {
                    throw new Error("Didnt find the email in customers inbox!");
                }
                cy.task("log", "Found the email in customers inbox!");
                const attachedFiles: string[] = receivedEmail.attachments;
                // Check if the email contains the sent files
                if (attachedFiles.length !== 5) {
                    throw new Error(
                        `The sent email does not contain the correct amount of files! Amount of files found: ${attachedFiles.length}`
                    );
                }
                cy.task("log", "Confirmed that the correct amount of files are attached to the email!");
            } catch (error) {
                if (retries > 0) {
                    // eslint-disable-next-line cypress/no-unnecessary-waiting
                    cy.wait(1000); // The timeout between retries
                    this.loop(retries - 1, timestamp);
                } else {
                    throw error;
                }
            }
        });
    }
};
export default EndChatView;
