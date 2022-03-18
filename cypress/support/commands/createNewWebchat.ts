import * as Constants from "../../utils/constants";
import PreEngagementChatForm from "../../pageObjects/preEngagementChatForm";
import ChatMessagesView from "../../pageObjects/Chat/chatMessagesView";

export const createNewWebchat = () => {
    PreEngagementChatForm.getNameInput().type(Constants.CUSTOMER_NAME);
    PreEngagementChatForm.getEmailInput().type(Constants.CORRECT_EMAIL);
    PreEngagementChatForm.getQueryTextarea().type(Constants.CUSTOMER_WELCOME_TEXT);
    PreEngagementChatForm.getStartChatButton().click();
    ChatMessagesView.validateChatStartedVisible(30000);
};
