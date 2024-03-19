import { Conversation } from "../../../../__mocks__/@twilio/conversations/conversation";
import { initConversationListener } from "../conversationListener";

describe("initConversationListener", () => {
    it('adds a listener for the "update" event subset', () => {
        const dispatch = jest.fn();
        const conversation = new Conversation(
            {
                channel: "chat",
                entityName: "",
                uniqueName: "",
                attributes: {},
                lastConsumedMessageIndex: 0,
                dateCreated: new Date(),
                dateUpdated: new Date()
            },
            "sid",
            {
                self: "",
                messages: "",
                participants: ""
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {} as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {} as any
        );

        initConversationListener(conversation, dispatch);
        conversation.emit("updated", {
            conversation,
            updateReasons: ["state"]
        });
        expect(dispatch).toHaveBeenCalledTimes(1);

        // dispatch should be called if updatedReasons: ["state"] only
        conversation.emit("updated", {
            conversation,
            updateReasons: ["status"]
        });
        expect(dispatch).toHaveBeenCalledTimes(1);
    });
});
