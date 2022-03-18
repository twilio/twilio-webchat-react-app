import * as Constants from "../utils/constants";

const PreEngagementChatForm = {
    toggleWebchatExpanded() {
        cy.get('[data-test="entry-point-button"]').click();
    },

    getStartChatButton() {
        return cy.get('button[data-test="pre-engagement-start-chat-button"]');
    },

    getNameInput() {
        return cy.get('[data-test="pre-engagement-chat-form-name-input"]');
    },

    getEmailInput() {
        return cy.get('[data-test="pre-engagement-chat-form-email-input"]');
    },

    getQueryTextarea() {
        return cy.get('[data-test="pre-engagement-chat-form-query-textarea"]');
    },

    validateFormExist() {
        cy.get('[data-test="pre-engagement-chat-form"]').should("exist");
    },

    validateFieldErrorMessage(inputField, errorMessage: RegExp) {
        inputField.invoke("prop", "validationMessage").should("match", errorMessage);
    },

    validateEmail() {
        this.getEmailInput().type(Constants.INCORRECT_EMAIL);
        this.getStartChatButton().click();
        if (Cypress.isBrowser("firefox")) {
            this.validateFieldErrorMessage(this.getEmailInput(), Constants.INCORRECT_EMAIL_ERROR_MESSAGE_FIREFOX);
        }
        if (Cypress.isBrowser(["chrome", "edge"])) {
            this.validateFieldErrorMessage(this.getEmailInput(), Constants.INCORRECT_EMAIL_ERROR_MESSAGE_CHROME);
        }
    }
};
export default PreEngagementChatForm;
