import * as Constants from "../../utils/constants";
import PreEngagementChatForm from "../../pageObjects/preEngagementChatForm";
import ChatMessagesView from "../../pageObjects/Chat/chatMessagesView";
import MessageInputBoxView from "../../pageObjects/Chat/messageInputBoxView";
import EndChatView from "../../pageObjects/endChatView";
import ChatNotificationView from "../../pageObjects/Chat/chatNotificationView";

export {};

describe("Webchat Lite general scenario's", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("FLEXEXP-107 - Webchat Lite - Pre-engagement data - Form input fields validation - Invalid email", () => {
        PreEngagementChatForm.toggleWebchatExpanded();
        PreEngagementChatForm.getStartChatButton().click();
        PreEngagementChatForm.validateFormExist();
        PreEngagementChatForm.validateFieldErrorMessage(
            PreEngagementChatForm.getNameInput(),
            Constants.EMPTY_FIELD_ERROR_MESSAGE
        );
        PreEngagementChatForm.getNameInput().type(Constants.CUSTOMER_NAME);
        PreEngagementChatForm.getStartChatButton().click();
        PreEngagementChatForm.validateFieldErrorMessage(
            PreEngagementChatForm.getEmailInput(),
            Constants.EMPTY_FIELD_ERROR_MESSAGE
        );
        PreEngagementChatForm.validateEmail();
        PreEngagementChatForm.getEmailInput().clear();
        PreEngagementChatForm.getEmailInput().type(Constants.CORRECT_EMAIL);
        PreEngagementChatForm.getStartChatButton().click();
        PreEngagementChatForm.validateFieldErrorMessage(
            PreEngagementChatForm.getQueryTextarea(),
            Constants.EMPTY_FIELD_ERROR_MESSAGE
        );
        PreEngagementChatForm.getQueryTextarea().type(Constants.CUSTOMER_WELCOME_TEXT);
        PreEngagementChatForm.getEmailInput().clear();
        PreEngagementChatForm.validateEmail();
        PreEngagementChatForm.validateFormExist();
    });

    it("FLEXEXP-106 - Webchat Lite - Pre-engagement data", function flexExp106() {
        PreEngagementChatForm.toggleWebchatExpanded();
        cy.createNewWebchat();
        cy.storeWebchatSessionCookie();
        MessageInputBoxView.getMessageInputTextArea().type(Constants.CUSTOMER_MESSAGE).type("{enter}");
        cy.getConversationSid()
            .as("convoSid")
            .then(() => {
                cy.task("getCustomerName", { conversationSid: this.convoSid }).should(
                    "include",
                    Constants.CUSTOMER_NAME
                );
            });
    });

    it("FLEXEXP-110 - Webchat Lite - Active chat - Close and open chat box", function flexExp110() {
        cy.resumeWebchatSessionCookie();
        PreEngagementChatForm.toggleWebchatExpanded();
        ChatMessagesView.validateMessagesRootContainerExist();
        cy.validateLastTextMessage(Constants.CUSTOMER_MESSAGE);
        PreEngagementChatForm.toggleWebchatExpanded();
        ChatMessagesView.validateMessagesRootContainerNotExist();
        PreEngagementChatForm.toggleWebchatExpanded();
        cy.validateLastTextMessage(Constants.CUSTOMER_MESSAGE);
    });

    it("FLEXEXP-111 - Webchat Lite - Active chat - exchange message", function flexExp111() {
        cy.resumeWebchatSessionCookie();
        PreEngagementChatForm.toggleWebchatExpanded();
        ChatMessagesView.validateMessagesRootContainerExist();
        cy.validateLastTextMessage(Constants.CUSTOMER_MESSAGE);
        cy.getConversationSid()
            .as("convoSid")
            .then(() => {
                cy.task("acceptReservation", { conversationSid: this.convoSid });
                cy.task("sendMessage", { conversationSid: this.convoSid, messageText: Constants.AGENT_MESSAGE }).then(
                    () => {
                        cy.validateLastTextMessage(Constants.AGENT_MESSAGE);
                    }
                );
            });
    });

    it("FLEXEXP-208 - Webchat Lite - Customer new message indicator", function flexExp208() {
        cy.resumeWebchatSessionCookie();
        PreEngagementChatForm.toggleWebchatExpanded();
        ChatMessagesView.validateNewMessageSeparatorExist();
        cy.validateLastTextMessage(Constants.AGENT_MESSAGE);
        MessageInputBoxView.getMessageInputTextArea().focus();
        cy.wait(1000);
        ChatMessagesView.getMessagesRootContainer().click();
        ChatMessagesView.validateNewMessageSeparatorNotExist();
    });

    it("FLEXEXP-115 - Webchat Lite - file attachments - upload - send - png", function flexExp115() {
        cy.resumeWebchatSessionCookie();
        PreEngagementChatForm.toggleWebchatExpanded();
        cy.addAttachmentFileAndSend(Constants.FileTypes.PNG);
        cy.getConversationSid()
            .as("convoSid")
            .then(() => {
                cy.task("getLastMessageMediaData", { conversationSid: this.convoSid }).should(
                    "include",
                    Constants.FileTypes.PNG
                );
            });
        cy.validateLastAttachmentMessage(Constants.FileTypes.PNG);
    });

    it("FLEXEXP-116 Webchat Lite - file attachments - upload - send - txt", function flexExp116() {
        cy.resumeWebchatSessionCookie();
        PreEngagementChatForm.toggleWebchatExpanded();
        cy.addAttachmentFileAndSend(Constants.FileTypes.TXT);
        cy.getConversationSid()
            .as("convoSid")
            .then(() => {
                cy.task("getLastMessageMediaData", { conversationSid: this.convoSid }).should(
                    "include",
                    Constants.FileTypes.TXT
                );
            });
        cy.validateLastAttachmentMessage(Constants.FileTypes.TXT);
    });

    it("FLEXEXP-117 Webchat Lite - file attachments - upload - send - jpg", function flexExp117() {
        cy.resumeWebchatSessionCookie();
        PreEngagementChatForm.toggleWebchatExpanded();
        cy.addAttachmentFileAndSend(Constants.FileTypes.JPG);
        cy.getConversationSid()
            .as("convoSid")
            .then(() => {
                cy.task("getLastMessageMediaData", { conversationSid: this.convoSid }).should(
                    "include",
                    Constants.FileTypes.JPG
                );
            });
        cy.validateLastAttachmentMessage(Constants.FileTypes.JPG);
    });

    it("FLEXEXP-146 Webchat Lite - file attachments- receive - download - invalid file extension", function flexExp146() {
        cy.resumeWebchatSessionCookie();
        PreEngagementChatForm.toggleWebchatExpanded();
        cy.addAttachmentFileAndSend(Constants.FileTypes.JPG);
        cy.getConversationSid()
            .as("convoSid")
            // eslint-disable-next-line sonarjs/no-identical-functions
            .then(() => {
                cy.task("getLastMessageMediaData", { conversationSid: this.convoSid }).should(
                    "include",
                    Constants.FileTypes.JPG
                );
            });
        cy.validateLastAttachmentMessage(Constants.FileTypes.JPG);
        cy.getConversationSid()
            .as("convoSid")
            .then(() => {
                // find the way to add attachment from agent side
                cy.task("sendMessage", { conversationSid: this.convoSid, messageText: Constants.AGENT_MESSAGE }).then(
                    () => {
                        cy.validateLastTextMessage(Constants.AGENT_MESSAGE);
                    }
                );
            });
    });

    it("FLEXEXP-118 Webchat Lite - file attachments - upload - send - pdf", function flexExp118() {
        cy.resumeWebchatSessionCookie();
        PreEngagementChatForm.toggleWebchatExpanded();
        cy.addAttachmentFileAndSend(Constants.FileTypes.PDF);
        cy.getConversationSid()
            .as("convoSid")
            .then(() => {
                cy.task("getLastMessageMediaData", { conversationSid: this.convoSid }).should(
                    "include",
                    Constants.FileTypes.PDF
                );
            });
        cy.validateLastAttachmentMessage(Constants.FileTypes.PDF);
    });

    it("FLEXEXP-119 - Webchat Lite - file attachments - upload - choose different file", function flexExp119() {
        cy.resumeWebchatSessionCookie();
        PreEngagementChatForm.toggleWebchatExpanded();
        MessageInputBoxView.getMessageFileInput().attachFile(`${Constants.FILEPATH}/${Constants.FileTypes.JPG}`);
        MessageInputBoxView.getMessageAttachments().contains(Constants.FileTypes.JPG);
        MessageInputBoxView.getMessageFileAttachmentRemoveButton().click();
        MessageInputBoxView.validateMessageFileAttachmentRemoveButtonNotExist();
        MessageInputBoxView.validateMessageAttachmentsNotVisible();
        cy.addAttachmentFileAndSend(Constants.FileTypes.JPG2);
        cy.getConversationSid()
            .as("convoSid")
            .then(() => {
                cy.task("getLastMessageMediaData", { conversationSid: this.convoSid }).should(
                    "include",
                    Constants.FileTypes.JPG2
                );
            });
        cy.validateLastAttachmentMessage(Constants.FileTypes.JPG2);
    });

    it("FLEXEXP-122 Webchat Lite - file attachments - send - preview/download", function flexExp122() {
        cy.resumeWebchatSessionCookie();
        PreEngagementChatForm.toggleWebchatExpanded();
        cy.addAttachmentFileAndSend(Constants.FileTypes.JPG);
        cy.getConversationSid()
            .as("convoSid")
            // eslint-disable-next-line sonarjs/no-identical-functions
            .then(() => {
                cy.task("getLastMessageMediaData", { conversationSid: this.convoSid }).should(
                    "include",
                    Constants.FileTypes.JPG
                );
                /*
                 * find the way to validate link
                 * cy.task("validateAttachmentLink", { conversationSid: this.convoSid }).should("contain", "Media");
                 */
            });
        cy.validateLastAttachmentMessage(Constants.FileTypes.JPG);
    });

    it("FLEXEXP-144 Webchat Lite - file attachments - upload - send - invalid file extension", function flexExp144() {
        cy.resumeWebchatSessionCookie();
        PreEngagementChatForm.toggleWebchatExpanded();
        MessageInputBoxView.getMessageFileInput().attachFile(`${Constants.FILEPATH}/${Constants.FileTypes.JSON}`);
        ChatNotificationView.getAlertMessageText().contains(Constants.INVALID_FILE_ERROR);
        ChatNotificationView.getAlertMessage().within(() => {
            ChatNotificationView.getAlertMessageExitButton().click();
        });
        ChatNotificationView.validateAlertMessageNotExist();
        MessageInputBoxView.validateMessageAttachmentsNotVisible();
    });

    it("FLEXEXP-145 Webchat Lite - file attachments - upload - exceeds allowed file size", function flexExp145() {
        cy.resumeWebchatSessionCookie();
        PreEngagementChatForm.toggleWebchatExpanded();
        MessageInputBoxView.getMessageFileInput().attachFile(`${Constants.FILEPATH}/${Constants.FileTypes.LARGE_PDF}`);
        ChatNotificationView.getAlertMessageText().contains(Constants.LARGE_FILE_ERROR);
        ChatNotificationView.getAlertMessage().within(() => {
            ChatNotificationView.getAlertMessageExitButton().click();
        });
        ChatNotificationView.validateAlertMessageNotExist();
        MessageInputBoxView.validateMessageAttachmentsNotVisible();
    });

    it("FLEXEXP-135 Webchat Lite - file attachments - adding text to message - uploading a file", function flexExp135() {
        cy.resumeWebchatSessionCookie();
        PreEngagementChatForm.toggleWebchatExpanded();
        MessageInputBoxView.getMessageInputTextArea().type(Constants.CUSTOMER_MESSAGE_TEXT_ATTACHMENT);
        cy.addAttachmentFileAndSend(Constants.FileTypes.JPG);
        cy.getConversationSid()
            .as("convoSid")
            .then(() => {
                cy.task("getLastMessageMediaData", { conversationSid: this.convoSid }).should(
                    "include",
                    Constants.FileTypes.JPG
                );
                cy.task("getLastMessageText", { conversationSid: this.convoSid }).should(
                    "include",
                    Constants.CUSTOMER_MESSAGE_TEXT_ATTACHMENT
                );
            });
        cy.validateLastAttachmentMessage(Constants.FileTypes.JPG);
        cy.validateLastTextMessage(Constants.CUSTOMER_MESSAGE_TEXT_ATTACHMENT);
    });

    it("FLEXEXP-136 Webchat Lite - file attachments - upload file - adding text to message", function flexExp136() {
        cy.resumeWebchatSessionCookie();
        PreEngagementChatForm.toggleWebchatExpanded();
        cy.addAttachmentFile(Constants.FileTypes.JPG);
        MessageInputBoxView.getMessageInputTextArea().type(Constants.CUSTOMER_MESSAGE_ATTACHMENT_TEXT);
        MessageInputBoxView.getMessageSendButton().click();
        cy.getConversationSid()
            .as("convoSid")
            .then(() => {
                cy.task("getLastMessageMediaData", { conversationSid: this.convoSid }).should(
                    "include",
                    Constants.FileTypes.JPG
                );
                cy.task("getLastMessageText", { conversationSid: this.convoSid }).should(
                    "include",
                    Constants.CUSTOMER_MESSAGE_ATTACHMENT_TEXT
                );
            });
        cy.validateLastAttachmentMessage(Constants.FileTypes.JPG);
        cy.validateLastTextMessage(Constants.CUSTOMER_MESSAGE_ATTACHMENT_TEXT);
    });

    it("FLEXEXP-109 - Webchat Lite - Active chat - Agent ends chat", function flexExp109() {
        cy.resumeWebchatSessionCookie();
        PreEngagementChatForm.toggleWebchatExpanded();
        cy.getConversationSid()
            .as("convoSid")
            .then(() => {
                cy.task("wrapReservation", { conversationSid: this.convoSid });
                cy.task("completeReservation", { conversationSid: this.convoSid });
                EndChatView.validateStartNewChatButtonVisible(10000);
            });
    });
});
