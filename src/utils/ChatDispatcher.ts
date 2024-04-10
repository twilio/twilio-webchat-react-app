import { sessionDataHandler } from "../sessionDataHandler";
import { changeEngagementPhase, changeExpandedStatus, updateMessageInput, updatePreEngagementData } from "../store/actions/genericActions";
import { EngagementPhase } from "../store/definitions";
import { store } from "../store/store";

export class ChatDispatcher {
    /**
     *  Expands the chat window
     */
    public openChatWindow() {
        // Open chat window
        store.dispatch(changeExpandedStatus({ expanded: true }));
    }

    /**
     * Closes the chat window
     */
    public closeChatWindow() {
        // Close chat window
        store.dispatch(changeExpandedStatus({ expanded: false }));
    }

    /**
     * Opens the chat window and prefills the message input with the provided message
     *
     * @remarks
     * This would not send a message to the agent, it merely pre-fills the message input.
     *
     * @param message - The message to prefill the message input with
     */
    public showNewMessage(message: string) {
        const state = store.getState();

        if (state.session?.currentPhase === "PreEngagementForm") {
            store.dispatch(updatePreEngagementData({ query: message }));
        } else {
            store.dispatch(updateMessageInput(message));
        }
        this.openChatWindow();
    }

    /**
     * The callback is called when the chat window is shown
     *
     * @param callback - The callback to be called when the chat window is shown. It does not receive any arguments.
     */
    public onShow(callback: () => void) {
        let previousValue: boolean | undefined;

        store.subscribe(() => {
            const state = store.getState();
            const currentValue = state.session.expanded;
            const valueChanged = previousValue !== undefined && previousValue !== currentValue;
            previousValue = currentValue;

            if (!currentValue || !valueChanged) {
                return;
            }

            callback();
        });
    }

    /**
     * The callback is called when the chat window is hidden
     *
     * @param callback - The callback to be called when the chat window is hidden. It does not receive any arguments.
     */
    public onHide(callback: () => void) {
        let previousValue: boolean | undefined;

        store.subscribe(() => {
            const state = store.getState();
            const currentValue = state.session.expanded;
            const valueChanged = previousValue !== undefined && previousValue !== currentValue;
            previousValue = currentValue;
            if (currentValue || !valueChanged) {
                return;
            }

            callback();
        });
    }

    /**
     * Whenever the amount of unread messages changes, the callback is called with the new count
     *
     * @remarks
     * The amount of messages will change when the user reads a message, or when the agent responds
     * to the user but the chat window is minimized
     *
     * @param callback - The callback to be called when the amount of unread messages changes. It receives the new count as an argument.
     */
    public onUnreadCountChange(callback: (newCount: number) => void) {
        let previousValue: number | undefined;

        store.subscribe(() => {
            const state = store.getState();
            const lastReadMessageIndex = state.chat?.conversation?.channelState?.lastReadMessageIndex;
            const lastmessageIndex = state.chat?.conversation?.channelState?.lastMessage?.index;

            if (lastReadMessageIndex === undefined || lastmessageIndex === undefined) {
                return;
            }

            const indicesDiff = lastmessageIndex - lastReadMessageIndex;

            const unreadCount = indicesDiff >= 0 ? indicesDiff : 0;

            if (unreadCount === previousValue) {
                return;
            }

            previousValue = unreadCount;
            callback(unreadCount);
        });
    }

    public resetSession() {
        sessionDataHandler.clear();
        store.dispatch(updatePreEngagementData({ email: "", name: "", query: "" }));
        store.dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
    }
}
