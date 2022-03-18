import { Message } from "@twilio/conversations";

import { Conversation } from "../../../../__mocks__/@twilio/conversations/conversation";
import { initMessagesListener } from "../messagesListener";
import { ACTION_ADD_MESSAGE, ACTION_REMOVE_MESSAGE, ACTION_UPDATE_MESSAGE } from "../../actionTypes";

describe("initMessagesListener", () => {
    let conversation: Conversation;

    beforeEach(() => {
        conversation = new Conversation(
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
    });

    afterEach(() => {
        conversation.removeAllListeners();
    });

    it('adds a listener for the "messageAdded" event', () => {
        const dispatch = jest.fn();

        initMessagesListener(conversation, dispatch);
        const message = {} as Message;
        conversation.emit("messageAdded", message);
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({
            type: ACTION_ADD_MESSAGE,
            payload: expect.objectContaining({ message })
        });
    });

    it('adds a listener for the "messageUpdated" event', () => {
        const dispatch = jest.fn();

        initMessagesListener(conversation, dispatch);
        const message = {} as Message;
        conversation.emit("messageUpdated", {
            message,
            updateReasons: ["author"]
        });
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({
            type: ACTION_UPDATE_MESSAGE,
            payload: expect.objectContaining({ message })
        });
    });

    it('adds a listener for the "messageRemoved" event subset', () => {
        const dispatch = jest.fn();

        initMessagesListener(conversation, dispatch);
        const message = {} as Message;
        conversation.emit("messageRemoved", message);
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({
            type: ACTION_REMOVE_MESSAGE,
            payload: expect.objectContaining({ message })
        });
    });
});
