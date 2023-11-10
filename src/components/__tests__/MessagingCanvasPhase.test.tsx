import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useDispatch, useSelector } from "react-redux";

import { MessagingCanvasPhase } from "../MessagingCanvasPhase";
import { notifications } from "../../notifications";
import * as genericActions from "../../store/actions/genericActions";

jest.mock("react-redux");

jest.mock("../Header", () => ({
    Header: () => <div title="Header" />
}));

jest.mock("../NotificationBar", () => ({
    NotificationBar: () => <div title="NotificationBar" />
}));

jest.mock("../AttachFileDropArea", () => ({
    AttachFileDropArea: (props: any) => <div title="AttachFileDropArea">{props.children}</div>
}));

jest.mock("../MessageList", () => ({
    MessageList: () => <div title="MessageList" />
}));

jest.mock("../MessageInput", () => ({
    MessageInput: () => <div title="MessageInput" />
}));

jest.mock("../ConversationEnded", () => ({
    ConversationEnded: () => <div title="ConversationEnded" />
}));

const messageMock = {
    setBody: jest.fn(),
    build: jest.fn(),
    send: jest.fn()
};
const conversationMock = {
    getMessagesCount: jest.fn(),
    prepareMessage: jest.fn()
};
const TEST_QUERY = "test query";
describe("Messaging Canvas Phase", () => {
    let dispatchSpy: jest.SpyInstance;
    beforeEach(() => {
        dispatchSpy = jest.fn();
        (useDispatch as jest.Mock).mockReturnValue(dispatchSpy);
        (useSelector as jest.Mock).mockImplementation((callback: any) =>
            callback({
                chat: { conversationState: "closed" }
            })
        );
        conversationMock.getMessagesCount.mockResolvedValue(0);
        conversationMock.prepareMessage.mockReturnValue(messageMock);
        messageMock.setBody.mockReturnValue(messageMock);
        messageMock.build.mockReturnValue(messageMock);
        messageMock.send.mockReturnValue(messageMock);
    });

    it("renders the messaging canvas phase", () => {
        const { container } = render(<MessagingCanvasPhase />);

        expect(container).toBeInTheDocument();
    });

    it("dismisses any 'failedToInitSessionNotification'", () => {
        const removeNotificationSpy = jest.spyOn(genericActions, "removeNotification");

        render(<MessagingCanvasPhase />);

        expect(removeNotificationSpy).toHaveBeenCalledWith(notifications.failedToInitSessionNotification("").id);
    });

    it("renders the header", () => {
        const { queryByTitle } = render(<MessagingCanvasPhase />);

        expect(queryByTitle("Header")).toBeInTheDocument();
    });

    it("renders the notification bar", () => {
        const { queryByTitle } = render(<MessagingCanvasPhase />);

        expect(queryByTitle("NotificationBar")).toBeInTheDocument();
    });

    it("renders the message list", () => {
        const { queryByTitle } = render(<MessagingCanvasPhase />);

        expect(queryByTitle("MessageList")).toBeInTheDocument();
    });

    it("renders message input (and file drop area wrapper) when conversation state is active", () => {
        (useSelector as jest.Mock).mockImplementation((callback: any) =>
            callback({ chat: { conversationState: "active" } })
        );

        const { queryByTitle } = render(<MessagingCanvasPhase />);

        expect(queryByTitle("AttachFileDropArea")).toBeInTheDocument();
        expect(queryByTitle("MessageInput")).toBeInTheDocument();
        expect(queryByTitle("ConversationEnded")).not.toBeInTheDocument();
    });

    it("renders conversation ended when conversation state is closed", () => {
        (useSelector as jest.Mock).mockImplementation((callback: any) =>
            callback({ chat: { conversationState: "closed" } })
        );

        const { queryByTitle } = render(<MessagingCanvasPhase />);

        expect(queryByTitle("ConversationEnded")).toBeInTheDocument();
        expect(queryByTitle("MessageInput")).not.toBeInTheDocument();
    });

    it("User's query is auto populated when conversation is empty", async () => {
        (useSelector as jest.Mock).mockImplementation((callback: any) =>
            callback({
                chat: { conversationState: "closed", conversation: conversationMock },
                session: { preEngagementData: { query: TEST_QUERY } }
            })
        );
        await waitFor(() => render(<MessagingCanvasPhase />));

        expect(conversationMock.prepareMessage).toHaveBeenCalled();
        expect(conversationMock.prepareMessage().setBody).toHaveBeenCalledWith(TEST_QUERY);
        expect(conversationMock.prepareMessage().setBody().build).toHaveBeenCalled();
        expect(conversationMock.prepareMessage().setBody().build().send).toHaveBeenCalled();
    });

    it("Should not trigger conversation if messages exists", async () => {
        (useSelector as jest.Mock).mockImplementation((callback: any) =>
            callback({
                chat: { conversationState: "closed", conversation: conversationMock },
                session: { preEngagementData: { query: TEST_QUERY } }
            })
        );
        conversationMock.getMessagesCount.mockResolvedValue(1);
        await waitFor(() => render(<MessagingCanvasPhase />));

        expect(conversationMock.prepareMessage).toHaveBeenCalledTimes(0);
    });

    it("Should not trigger conversation if user's query is empty", async () => {
        (useSelector as jest.Mock).mockImplementation((callback: any) =>
            callback({
                chat: { conversationState: "closed", conversation: conversationMock }
            })
        );
        conversationMock.getMessagesCount.mockResolvedValue(1);
        await waitFor(() => render(<MessagingCanvasPhase />));

        expect(conversationMock.prepareMessage).toHaveBeenCalledTimes(0);
    });

    it("Should not trigger conversation if conversation is not initialised", async () => {
        (useSelector as jest.Mock).mockImplementation((callback: any) =>
            callback({
                chat: { conversationState: "closed" },
                session: { preEngagementData: { query: TEST_QUERY } }
            })
        );
        conversationMock.getMessagesCount.mockResolvedValue(1);
        await waitFor(() => render(<MessagingCanvasPhase />));

        expect(conversationMock.prepareMessage).toHaveBeenCalledTimes(0);
    });

    it("Should not trigger conversation if user's query is empty and conversation is also missing", async () => {
        (useSelector as jest.Mock).mockImplementation((callback: any) =>
            callback({
                chat: { conversationState: "closed" }
            })
        );
        conversationMock.getMessagesCount.mockResolvedValue(1);
        await waitFor(() => render(<MessagingCanvasPhase />));

        expect(conversationMock.prepareMessage).toHaveBeenCalledTimes(0);
    });
});
