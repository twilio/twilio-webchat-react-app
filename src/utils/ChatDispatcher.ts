import { sessionDataHandler } from "../sessionDataHandler";
import { changeEngagementPhase, changeExpandedStatus, updateMessageInput, updatePreEngagementData } from "../store/actions/genericActions";
import { EngagementPhase } from "../store/definitions";
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

    public showNewMessage(message: string) {
        const state = store.getState();

        if (state.session?.currentPhase === "PreEngagementForm") {
            store.dispatch(updatePreEngagementData({ query: message }));
        } else {
            store.dispatch(updateMessageInput(message));
        }
        this.openChatWindow();
    }

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
