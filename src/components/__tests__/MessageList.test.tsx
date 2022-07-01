import { fireEvent, render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useSelector } from "react-redux";

import { MessageList } from "../MessageList";
import { getMoreMessages } from "../../store/actions/genericActions";
import { SeparatorType } from "../definitions";

const fileAttachmentConfig = {
    enabled: true,
    maxFileSize: 16777216,
    acceptedExtensions: ["jpg", "jpeg", "png", "amr", "mp3", "mp4", "pdf"]
};
const user1 = {
    identity: "identity 1",
    friendlyName: "name 1"
};
const user2 = {
    identity: "identity 2",
    friendlyName: "name 2"
};
const message1 = {
    index: 0,
    author: user1.identity,
    dateCreated: new Date("01/01/2021"),
    body: "message 1"
};
const message2 = {
    index: 1,
    author: user2.identity,
    dateCreated: new Date("01/02/2021"),
    body: "message 2"
};
const defaultState = {
    chat: {
        conversation: {
            dateCreated: message1.dateCreated,
            getMessagesCount: jest.fn(),
            addListener: jest.fn(),
            removeListener: jest.fn()
        },
        conversationsClient: { user: user1 },
        messages: [message1, message2],
        participants: [],
        users: [user1, user2]
    },
    config: { fileAttachment: fileAttachmentConfig }
};
const messageBubbleTestId = "message-bubble";

jest.mock("react-redux", () => ({
    useDispatch: () => jest.fn(),
    useSelector: jest.fn()
}));

jest.mock("../../store/actions/genericActions", () => ({
    getMoreMessages: jest.fn()
}));

jest.mock("../MessageListSeparator", () => ({
    MessageListSeparator: ({ separatorType }: { separatorType: SeparatorType }) => (
        <div title={separatorType} role="separator" />
    )
}));

// Spinner component caused errors
jest.mock("@twilio-paste/core/spinner", () => ({
    Spinner: () => <div title="Spinner" />
}));

describe("Message List", () => {
    beforeEach(() => {
        (useSelector as jest.Mock).mockImplementation((callback: any) => callback(defaultState));
    });

    it("renders the message list", () => {
        const { container } = render(<MessageList />);

        expect(container).toBeInTheDocument();
    });

    it("renders a message bubble for each message", () => {
        const { queryAllByTestId, queryByText } = render(<MessageList />);

        expect(queryAllByTestId(messageBubbleTestId)).toHaveLength(2);
        expect(queryByText(message1.body)).toBeInTheDocument();
        expect(queryByText(message2.body)).toBeInTheDocument();
    });

    it("does not render any chat items if no messages object", () => {
        (useSelector as jest.Mock).mockImplementation((callback: any) =>
            callback({
                ...defaultState,
                chat: {
                    ...defaultState.chat,
                    messages: null
                }
            })
        );

        const { queryAllByTestId, queryAllByTitle } = render(<MessageList />);

        expect(queryAllByTestId(messageBubbleTestId)).toHaveLength(0);
        expect(queryAllByTitle("Spinner")).toHaveLength(0);
    });

    it("renders a participant typing", () => {
        (useSelector as jest.Mock).mockImplementation((callback: any) =>
            callback({
                ...defaultState,
                chat: {
                    ...defaultState.chat,
                    participants: [{ identity: user1.identity }, { identity: user2.identity, isTyping: true }]
                }
            })
        );

        const { queryByText } = render(<MessageList />);

        expect(queryByText(`${user2.friendlyName} is typing...`)).toBeInTheDocument();
    });

    it("does not render client participant typing", () => {
        (useSelector as jest.Mock).mockImplementation((callback: any) =>
            callback({
                ...defaultState,
                chat: {
                    ...defaultState.chat,
                    participants: [{ identity: user1.identity, isTyping: true }, { identity: user2.identity }]
                }
            })
        );

        const { queryByText } = render(<MessageList />);

        expect(queryByText(`${user1.friendlyName} is typing...`)).not.toBeInTheDocument();
    });

    it("renders loading spinner when there are non-loaded messages", async () => {
        const getMessagesCountSpy = jest
            .spyOn(defaultState.chat.conversation, "getMessagesCount")
            .mockImplementation(() => 4); // 2 messages are loaded initially

        const { queryByTitle } = render(<MessageList />);

        await waitFor(() => {
            expect(getMessagesCountSpy).toHaveBeenCalled();
            expect(queryByTitle("Spinner")).toBeInTheDocument();
        });
    });

    it("does not render loading spinner when all messages loaded", async () => {
        const getMessagesCountSpy = jest
            .spyOn(defaultState.chat.conversation, "getMessagesCount")
            .mockImplementation(() => 2); // 2 messages are loaded initially

        const { queryByTitle } = render(<MessageList />);

        await waitFor(() => {
            expect(getMessagesCountSpy).toHaveBeenCalled();
            expect(queryByTitle("Spinner")).not.toBeInTheDocument();
        });
    });

    it("correctly loads more messages when scrolled to top", async () => {
        const messages = [
            {
                index: 0,
                author: user2.identity,
                dateCreated: new Date(),
                body: "message 1"
            },
            {
                index: 1,
                author: user2.identity,
                dateCreated: new Date(),
                body: "message 2"
            },
            {
                index: 2,
                author: user2.identity,
                dateCreated: new Date(),
                body: "message 3"
            },
            {
                index: 3,
                author: user2.identity,
                dateCreated: new Date(),
                body: "message 4"
            },
            {
                index: 4,
                author: user2.identity,
                dateCreated: new Date(),
                body: "message 5"
            },
            {
                index: 5,
                author: user2.identity,
                dateCreated: new Date(),
                body: "message 6"
            },
            {
                index: 6,
                author: user2.identity,
                dateCreated: new Date(),
                body: "message 7"
            },
            {
                index: 7,
                author: user2.identity,
                dateCreated: new Date(),
                body: "message 8"
            }
        ];
        (useSelector as jest.Mock).mockImplementation((callback: any) =>
            callback({
                ...defaultState,
                chat: {
                    ...defaultState.chat,
                    messages
                }
            })
        );
        const totalMessagesCount = 20;
        const getMessagesCountSpy = jest
            .spyOn(defaultState.chat.conversation, "getMessagesCount")
            .mockImplementation(() => totalMessagesCount);

        const { getByRole } = render(<MessageList />);
        const scrollBox = getByRole("main");

        await waitFor(() => {
            fireEvent.scroll(scrollBox, { target: { scrollY: 0 } });

            expect(getMessagesCountSpy).toHaveBeenCalled();
            expect(getMoreMessages).toHaveBeenCalledWith({
                conversation: defaultState.chat.conversation,
                anchor: totalMessagesCount - messages.length - 1
            });
        });
    });

    describe("Separators", () => {
        it("renders a date separators when messages have 2 dates", () => {
            const { queryAllByRole } = render(<MessageList />);

            expect(queryAllByRole("separator")).toHaveLength(1);
        });

        it("doesn't render a date separator when all messages are from today", () => {
            const messageToday1 = {
                index: 0,
                author: user1.identity,
                dateCreated: new Date(),
                body: "message 1"
            };
            const messageToday2 = {
                index: 1,
                author: user2.identity,
                dateCreated: new Date(),
                body: "message 2"
            };
            (useSelector as jest.Mock).mockImplementation((callback: any) =>
                callback({
                    ...defaultState,
                    chat: {
                        ...defaultState.chat,
                        messages: [messageToday1, messageToday2]
                    }
                })
            );

            const { queryAllByRole, queryAllByTitle } = render(<MessageList />);

            expect(queryAllByTitle("date")).toHaveLength(0);
            expect(queryAllByRole("separator")).toHaveLength(0);
        });

        it("renders a Today date separators when messages are from today and yesterday", () => {
            const yesterdayDate = new Date();
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const messageYesterday = {
                index: 0,
                author: user1.identity,
                dateCreated: yesterdayDate,
                body: "message yesterday"
            };
            const messageToday = {
                index: 1,
                author: user2.identity,
                dateCreated: new Date(),
                body: "message today"
            };
            (useSelector as jest.Mock).mockImplementation((callback: any) =>
                callback({
                    ...defaultState,
                    chat: {
                        ...defaultState.chat,
                        messages: [messageYesterday, messageToday]
                    }
                })
            );

            const { queryAllByRole, queryAllByTitle } = render(<MessageList />);

            expect(queryAllByTitle("date")).toHaveLength(1);
            expect(queryAllByRole("separator")).toHaveLength(1);
        });

        it("renders 1 New separator when 2 messages unread", () => {
            const messageNew1 = {
                index: 0,
                author: user1.identity,
                dateCreated: new Date(),
                body: "message 1"
            };
            const messageNew2 = {
                index: 1,
                author: user2.identity,
                dateCreated: new Date(),
                body: "message 2"
            };
            const messageNew3 = {
                index: 2,
                author: user2.identity,
                dateCreated: new Date(),
                body: "message 3"
            };

            (useSelector as jest.Mock).mockImplementation((callback: any) =>
                callback({
                    ...defaultState,
                    chat: {
                        ...defaultState.chat,
                        messages: [messageNew1, messageNew2, messageNew3],
                        conversation: {
                            ...defaultState.chat.conversation,
                            lastReadMessageIndex: 0
                        }
                    }
                })
            );

            const { queryAllByRole, queryAllByTitle } = render(<MessageList />);

            expect(queryAllByTitle("new")).toHaveLength(1);
            expect(queryAllByRole("separator")).toHaveLength(1);
        });

        it("renders no New separator when all messages read", () => {
            const messageNew1 = {
                index: 0,
                author: user1.identity,
                dateCreated: new Date(),
                body: "message 1"
            };
            const messageNew2 = {
                index: 1,
                author: user2.identity,
                dateCreated: new Date(),
                body: "message 2"
            };
            const messageNew3 = {
                index: 2,
                author: user2.identity,
                dateCreated: new Date(),
                body: "message 3"
            };

            (useSelector as jest.Mock).mockImplementation((callback: any) =>
                callback({
                    ...defaultState,
                    chat: {
                        ...defaultState.chat,
                        messages: [messageNew1, messageNew2, messageNew3],
                        conversation: {
                            ...defaultState.chat.conversation,
                            lastReadMessageIndex: 2
                        }
                    }
                })
            );

            const { queryAllByRole, queryAllByTitle } = render(<MessageList />);

            expect(queryAllByTitle("new")).toHaveLength(0);
            expect(queryAllByRole("separator")).toHaveLength(0);
        });

        it("renders no New separator when unread messages belongs to current user", () => {
            const messageNew1 = {
                index: 0,
                author: user1.identity,
                dateCreated: new Date(),
                body: "message 1"
            };
            const messageNew2 = {
                index: 1,
                author: user1.identity,
                dateCreated: new Date(),
                body: "message 2"
            };
            const messageNew3 = {
                index: 2,
                author: user1.identity,
                dateCreated: new Date(),
                body: "message 3"
            };

            (useSelector as jest.Mock).mockImplementation((callback: any) =>
                callback({
                    ...defaultState,
                    chat: {
                        ...defaultState.chat,
                        messages: [messageNew1, messageNew2, messageNew3],
                        conversation: {
                            ...defaultState.chat.conversation,
                            lastReadMessageIndex: 1
                        }
                    }
                })
            );

            const { queryAllByRole, queryAllByTitle } = render(<MessageList />);

            expect(queryAllByTitle("new")).toHaveLength(0);
            expect(queryAllByRole("separator")).toHaveLength(0);
        });

        it("renders only date separator when message is both first of date and first unread", () => {
            const messageNewToday = {
                index: 1,
                author: user2.identity,
                dateCreated: new Date(),
                body: "message 2"
            };

            (useSelector as jest.Mock).mockImplementation((callback: any) =>
                callback({
                    ...defaultState,
                    chat: {
                        ...defaultState.chat,
                        messages: [message1, messageNewToday],
                        conversation: {
                            ...defaultState.chat.conversation,
                            lastReadMessageIndex: 0
                        }
                    }
                })
            );

            const { queryAllByRole, queryAllByTitle } = render(<MessageList />);

            expect(queryAllByTitle("new")).toHaveLength(0);
            expect(queryAllByTitle("date")).toHaveLength(1);
            expect(queryAllByRole("separator")).toHaveLength(1); // 1 today date separator
        });
    });

    describe("Focus behavior", () => {
        it("focuses last message when list is focused and no other message is focused", () => {
            const { getByRole, queryAllByTestId } = render(<MessageList />);
            const messagesContainer = getByRole("log");
            const messageBubbles = queryAllByTestId(messageBubbleTestId);
            fireEvent.focus(messagesContainer);

            expect(messageBubbles[1]).toHaveFocus();
        });

        it("message list container is focusable when there are no messages", () => {
            (useSelector as jest.Mock).mockImplementation((callback: any) =>
                callback({
                    ...defaultState,
                    chat: {
                        ...defaultState.chat,
                        messages: []
                    }
                })
            );
            const { getByRole } = render(<MessageList />);
            const messagesContainer = getByRole("log");

            expect(messagesContainer.tabIndex).toBe(0);
        });

        it("message list container is not focusable when there is at least one message", () => {
            const { getByRole } = render(<MessageList />);

            const messagesContainer = getByRole("log");

            expect(messagesContainer.tabIndex).toBe(-1);
        });

        it("starts with focus on the most recent message when rendering with messages already in the store", () => {
            const { queryAllByTestId } = render(<MessageList />);

            const [, bottomBubble] = queryAllByTestId(messageBubbleTestId);

            expect(bottomBubble.tabIndex).toBe(0);
            expect(bottomBubble).toHaveFocus();
        });

        it("focuses previous message on up key press", () => {
            const { queryAllByTestId } = render(<MessageList />);

            const [topBubble, bottomBubble] = queryAllByTestId(messageBubbleTestId);

            fireEvent.keyDown(bottomBubble, {
                key: "ArrowUp"
            });

            expect(topBubble.tabIndex).toBe(0);
            expect(topBubble).toHaveFocus();
        });

        it("focuses next message on down key press", () => {
            const { queryAllByTestId } = render(<MessageList />);

            const [topBubble, bottomBubble] = queryAllByTestId(messageBubbleTestId);

            fireEvent.keyDown(bottomBubble, {
                key: "ArrowUp"
            });

            fireEvent.keyDown(topBubble, {
                key: "ArrowDown"
            });

            expect(bottomBubble.tabIndex).toBe(0);
            expect(bottomBubble).toHaveFocus();
        });

        it("does not focus if triggered by a click", async () => {
            const message3 = { ...message2, index: 2 };
            const messages = [message1, message2, message3];
            (useSelector as jest.Mock).mockImplementation((callback: any) =>
                callback({
                    ...defaultState,
                    chat: {
                        ...defaultState.chat,
                        messages
                    }
                })
            );
            const { queryAllByTestId } = render(<MessageList />);

            const [topBubble, middleBubble, bottomBubble] = queryAllByTestId(messageBubbleTestId);

            fireEvent.keyDown(bottomBubble, {
                key: "ArrowUp"
            });

            expect(middleBubble.tabIndex).toBe(0);
            expect(middleBubble).toHaveFocus();

            topBubble.click();

            expect(middleBubble.tabIndex).toBe(0);
            expect(middleBubble).toHaveFocus();
        });
    });
});
