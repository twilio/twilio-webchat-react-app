import * as Constants from "../../utils/constants";
import MessageInputBoxView from "../../pageObjects/Chat/messageInputBoxView";
import ChatMessagesView from "../../pageObjects/Chat/chatMessagesView";

export const addAttachmentFileAndSend = (fileName: string) => {
    MessageInputBoxView.getMessageFileInput().attachFile(`${Constants.FILEPATH}/${fileName}`);
    MessageInputBoxView.getMessageAttachments().contains(fileName);
    MessageInputBoxView.getMessageSendButton().click();
};

export const addAttachmentFile = (fileName: string) => {
    MessageInputBoxView.getMessageFileInput().attachFile(`${Constants.FILEPATH}/${fileName}`);
    MessageInputBoxView.getMessageAttachments().contains(fileName);
};

export const validateLastAttachmentMessage = (fileName: string) => {
    ChatMessagesView.getMessagesBubblesFile().last().should("contain", fileName);
};

export const validateLastTextMessage = (text: string) => {
    cy.wait(1000);
    ChatMessagesView.getAllMessagesBubbles().last().should("contain", text);
};
