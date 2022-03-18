import * as Constants from "../../utils/constants";
import MessageInputBoxView from "../../pageObjects/Chat/messageInputBoxView";

export const addAttachmentFileAndSend = (fileName: string) => {
    MessageInputBoxView.getMessageFileInput().attachFile(`${Constants.FILEPATH}/${fileName}`);
    MessageInputBoxView.getMessageAttachments().contains(fileName);
    MessageInputBoxView.getMessageSendButton().click();
};

export const addAttachmentFile = (fileName: string) => {
    MessageInputBoxView.getMessageFileInput().attachFile(`${Constants.FILEPATH}/${fileName}`);
    MessageInputBoxView.getMessageAttachments().contains(fileName);
};
