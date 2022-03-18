const ChatNotificationView = {
    getAlertMessage() {
        return cy.get('[data-test="alert-message"]');
    },

    getAlertMessageText() {
        return cy.get('[data-test="alert-message-text"]');
    },

    getAlertMessageExitButton() {
        return cy.get('[type="button"]');
    },

    validateAlertMessageNotExist() {
        this.getAlertMessage().should("not.exist");
    }
};
export default ChatNotificationView;
