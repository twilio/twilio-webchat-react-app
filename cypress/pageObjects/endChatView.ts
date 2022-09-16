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
    }
};
export default EndChatView;
