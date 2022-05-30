import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useDispatch, useSelector } from "react-redux";

import { MessagingCanvasPhase } from "../MessagingCanvasPhase";
import { updatePreEngagementData } from "../../store/actions/genericActions";
import { notifications } from "../../notifications";
import * as genericActions from "../../store/actions/genericActions";

jest.mock("react-redux", () => ({
    useSelector: jest.fn(),
    useDispatch: jest.fn()
}));

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

describe("Messaging Canvas Phase", () => {
    let dispatchSpy: jest.SpyInstance;
    beforeEach(() => {
        dispatchSpy = jest.fn();
        (useDispatch as jest.Mock).mockReturnValue(dispatchSpy);
    });

    it("renders the messaging canvas phase", () => {
        const { container } = render(<MessagingCanvasPhase />);

        expect(container).toBeInTheDocument();
    });

    it("resets pre-engagement data on render", () => {
        render(<MessagingCanvasPhase />);

        expect(dispatchSpy).toHaveBeenCalledWith(updatePreEngagementData({ email: "", name: "", query: "" }));
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
});
