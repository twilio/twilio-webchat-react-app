import { waitFor } from "@testing-library/react";
import { Conversation } from "../../../../__mocks__/@twilio/conversations/conversation";
import { initConversationListener } from "../conversationListener";

describe("initConversationListener", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });
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

    it("clears the participant list from the localStorage", async () => {
        const removeItemSpy = jest.spyOn(Object.getPrototypeOf(window.localStorage), "removeItem");
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

        conversation.getParticipantsCount = jest.fn().mockResolvedValue(1);

        initConversationListener(conversation, dispatch);
        conversation.emit("updated", {
            conversation,
            updateReasons: ["lastMessage"]
        });
        await waitFor(() => {
            expect(conversation.getParticipantsCount).toHaveBeenCalledTimes(1);
            expect(removeItemSpy).toHaveBeenCalledWith("TWILIO_CONVERSATION_USERS");
        });
    });
});
