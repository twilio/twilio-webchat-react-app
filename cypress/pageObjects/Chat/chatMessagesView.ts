const ChatMessagesView = {
    getChatStarted(time) {
        return cy.get('[data-test="chat-started"]', { timeout: time });
    },

    getMessagesRootContainer() {
        return cy.get('[data-test="root-container"]');
    },

    getNewMessageSeparator() {
        return cy.get('[data-test="new-message-separator"]');
    },

    getAllMessagesBubbles() {
        return cy.get('[data-test="all-message-bubbles"]');
    },

    getMessagesBubblesFile() {
        return cy.get('[data-test="file-preview-main-area"]');
    },

    validateChatStartedVisible(time) {
        this.getChatStarted(time).should("be.visible");
    },

    validateNewMessageSeparatorExist() {
        this.getNewMessageSeparator().should("exist");
    },

    validateNewMessageSeparatorNotExist() {
        this.getNewMessageSeparator().should("not.exist");
    },

    validateMessagesRootContainerExist() {
        this.getMessagesRootContainer().should("exist");
    },

    validateMessagesRootContainerNotExist() {
        this.getMessagesRootContainer().should("not.exist");
    }
};
export default ChatMessagesView;
