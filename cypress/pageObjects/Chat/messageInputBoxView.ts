const MessageInputBoxView = {
    getMessageInputTextArea() {
        return cy.get('[data-test="message-input-textarea"]');
    },

    getMessageFileInput() {
        return cy.get('input[type="file"]');
    },

    getMessageAttachments() {
        return cy.get('[data-test="message-attachments"]');
    },

    getMessageFileAttachmentRemoveButton() {
        return cy.get('[data-test="message-file-attachment-remove-button"]');
    },

    getMessageSendButton() {
        return cy.get('[data-test="message-send-button"]');
    },

    validateMessageFileAttachmentRemoveButtonNotExist() {
        this.getMessageFileAttachmentRemoveButton().should("not.exist");
    },

    validateMessageAttachmentsNotVisible() {
        this.getMessageAttachments().should("not.be.visible");
    }
};
export default MessageInputBoxView;
