import { changeExpandedStatus } from "../store/actions/genericActions";
import { store } from "../store/store";

export class ChatDispatcher {
    public openChatWindow() {
        // Open chat window
        store.dispatch(changeExpandedStatus({ expanded: true }));
    }

    public closeChatWindow() {
        // Close chat window
        store.dispatch(changeExpandedStatus({ expanded: false }));
    }
}
