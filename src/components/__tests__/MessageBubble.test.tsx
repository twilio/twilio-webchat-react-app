import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Media, Message } from "@twilio/conversations";
import { useSelector } from "react-redux";

import { MessageBubble } from "../MessageBubble";

const fileAttachmentConfig = {
    enabled: true,
    maxFileSize: 16777216,
    acceptedExtensions: ["jpg", "jpeg", "png", "amr", "mp3", "mp4", "pdf"]
};
const user1 = {
    identity: "my-identity",
    friendlyName: "my name"
};
const user2 = {
    identity: "your-identity",
    friendlyName: "your name"
};
const defaultState = {
    config: { fileAttachment: fileAttachmentConfig },
    chat: {
        conversationsClient: { user: user1 },
        participants: [{ identity: user1.identity }, { identity: user2.identity }],
        users: [user1, user2]
    }
};

const disabledAttachmentsUseSelectorCallback = (callback: any) =>
    callback({
        ...defaultState,
        config: { ...defaultState.config, fileAttachment: { ...fileAttachmentConfig, enabled: false } }
    });

jest.mock("react-redux", () => ({
    useSelector: jest.fn()
}));

jest.mock("../FilePreview", () => ({
    FilePreview: ({ file }: { file: File }) => <div title="FilePreview">{file.name}</div>
}));

describe("Message Bubble", () => {
    const media = { filename: "filename.jpg", contentType: "image/jpeg", size: 1 } as Media;
    const media2 = { filename: "filename2.jpg", contentType: "image/jpeg", size: 1 } as Media;
    const dateCreated = {
        getHours: () => 0,
        getMinutes: () => 0
    };
    const messageCurrentUser = {
        index: 0,
        author: user1.identity,
        dateCreated,
        body: "message by me"
    } as Message;
    const messageOtherUser = {
        index: 0,
        author: user2.identity,
        dateCreated,
        body: "message by you"
    } as Message;
    const avatarContainerTestId = "avatar-container";

    beforeEach(() => {
        (useSelector as jest.Mock).mockImplementation((callback: any) => callback(defaultState));
    });

    it("renders the message bubble", () => {
        const { container } = render(
            <MessageBubble
                message={messageCurrentUser}
                isLast={false}
                isLastOfUserGroup={false}
                focusable={false}
                updateFocus={jest.fn}
            />
        );

        expect(container).toBeInTheDocument();
    });

    it("renders the message author", () => {
        const { queryByText } = render(
            <MessageBubble
                message={messageCurrentUser}
                isLast={false}
                isLastOfUserGroup={false}
                focusable={false}
                updateFocus={jest.fn}
            />
        );

        expect(queryByText(user1.friendlyName)).toBeInTheDocument();
    });

    it("renders the message body", () => {
        const { queryByText } = render(
            <MessageBubble
                message={messageCurrentUser}
                isLast={false}
                isLastOfUserGroup={false}
                focusable={false}
                updateFocus={jest.fn}
            />
        );

        expect(queryByText(messageCurrentUser.body)).toBeInTheDocument();
    });

    it("renders the message timestamp", () => {
        const { queryByText } = render(
            <MessageBubble
                message={messageCurrentUser}
                isLast={false}
                isLastOfUserGroup={false}
                focusable={false}
                updateFocus={jest.fn}
            />
        );
        const timestampText = "00:00"; // 0:0 is what getHours():getMinutes() will be

        expect(queryByText(timestampText)).toBeInTheDocument();
    });

    it("screenreader includes 'sent at' text when author is current users", () => {
        const { queryByText } = render(
            <MessageBubble
                message={messageCurrentUser}
                isLast={false}
                isLastOfUserGroup={false}
                focusable={false}
                updateFocus={jest.fn}
            />
        );

        expect(queryByText("You sent at")).toBeInTheDocument();
    });

    it("screenreader includes 'sent at' text when author is other user", () => {
        const { getByText } = render(
            <MessageBubble
                message={messageOtherUser}
                isLast={false}
                isLastOfUserGroup={false}
                focusable={false}
                updateFocus={jest.fn}
            />
        );

        expect(getByText(`${user2.friendlyName} sent at`)).toBeInTheDocument();
    });

    it("renders 'is read' and icon when message read by other participant", () => {
        (useSelector as jest.Mock).mockImplementation((callback: any) =>
            callback({
                ...defaultState,
                chat: {
                    ...defaultState.chat,
                    participants: [{ identity: user1.identity }, { identity: user2.identity, lastReadMessageIndex: 0 }]
                }
            })
        );

        const { queryByText } = render(
            <MessageBubble
                message={messageCurrentUser}
                isLast={true}
                isLastOfUserGroup={false}
                focusable={false}
                updateFocus={jest.fn}
            />
        );

        expect(queryByText("Read")).toBeInTheDocument();
    });

    it("does not render 'is read' and icon when message unread by other participant", () => {
        const { queryByText } = render(
            <MessageBubble
                message={messageCurrentUser}
                isLast={true}
                isLastOfUserGroup={false}
                focusable={false}
                updateFocus={jest.fn}
            />
        );

        expect(queryByText("Read")).not.toBeInTheDocument();
    });

    it("renders avatar container when author is other user", () => {
        const { queryByTestId } = render(
            <MessageBubble
                message={messageOtherUser}
                isLast={true}
                isLastOfUserGroup={false}
                focusable={false}
                updateFocus={jest.fn}
            />
        );

        expect(queryByTestId(avatarContainerTestId)).toBeInTheDocument();
    });

    it("does not render avatar container when author is current user", () => {
        const { queryByTestId } = render(
            <MessageBubble
                message={messageCurrentUser}
                isLast={true}
                isLastOfUserGroup={false}
                focusable={false}
                updateFocus={jest.fn}
            />
        );

        expect(queryByTestId(avatarContainerTestId)).not.toBeInTheDocument();
    });

    it("renders avatar icon when author is other user and is last of group", () => {
        const { queryByTestId } = render(
            <MessageBubble
                message={messageOtherUser}
                isLast={true}
                isLastOfUserGroup={true}
                focusable={false}
                updateFocus={jest.fn}
            />
        );
        const avatarContainer = queryByTestId(avatarContainerTestId);
        const avatarIcon = avatarContainer?.querySelector("svg");

        expect(avatarIcon).toBeInTheDocument();
    });

    it("does not render avatar icon when author is other user but is not last of group", () => {
        const { queryByTestId } = render(
            <MessageBubble
                message={messageOtherUser}
                isLast={true}
                isLastOfUserGroup={false}
                focusable={false}
                updateFocus={jest.fn}
            />
        );
        const avatarContainer = queryByTestId(avatarContainerTestId);
        const avatarIcon = avatarContainer?.querySelector("svg");

        expect(avatarIcon).not.toBeInTheDocument();
    });

    it("render a file preview for all attached files in message", () => {
        const mediaMessage = {
            type: "media",
            attachedMedia: [media, media2],
            dateCreated
        } as Message;
        const { queryByText } = render(
            <MessageBubble
                message={mediaMessage}
                isLast={false}
                isLastOfUserGroup={false}
                focusable={false}
                updateFocus={jest.fn}
            />
        );

        expect(queryByText(media.filename)).toBeInTheDocument();
        expect(queryByText(media2.filename)).toBeInTheDocument();
    });

    it("does not render file previews if file attachments are disabled in config", () => {
        (useSelector as jest.Mock).mockImplementation(disabledAttachmentsUseSelectorCallback);

        const mediaMessage = {
            type: "media",
            attachedMedia: [media],
            dateCreated
        } as Message;
        const { queryByText } = render(
            <MessageBubble
                message={mediaMessage}
                isLast={false}
                isLastOfUserGroup={false}
                focusable={false}
                updateFocus={jest.fn}
            />
        );

        expect(queryByText("Media messages are not supported")).toBeInTheDocument();
        expect(queryByText(media.filename)).not.toBeInTheDocument();
    });

    it("does not render media not supported text for non-media messages if file attachments are disabled in config", () => {
        (useSelector as jest.Mock).mockImplementation(disabledAttachmentsUseSelectorCallback);

        const { queryByText } = render(
            <MessageBubble
                message={messageOtherUser}
                isLast={false}
                isLastOfUserGroup={false}
                focusable={false}
                updateFocus={jest.fn}
            />
        );

        expect(queryByText(messageOtherUser.body)).toBeInTheDocument();
        expect(queryByText("Media messages are not supported")).not.toBeInTheDocument();
    });

    it("does not render any file preview if no attached files in message", () => {
        const mediaMessage = {
            type: "media",
            attachedMedia: null,
            dateCreated
        } as Message;
        const { queryAllByTitle } = render(
            <MessageBubble
                message={mediaMessage}
                isLast={false}
                isLastOfUserGroup={false}
                focusable={false}
                updateFocus={jest.fn}
            />
        );

        expect(queryAllByTitle("FilePreview")).toHaveLength(0);
    });

    it("calls prop updateFocus on focus event", async () => {
        const updateFocusSpy = jest.fn();
        const message = {
            dateCreated,
            index: 0
        } as Message;
        const messageBubble = render(
            <MessageBubble
                message={message}
                isLast={false}
                isLastOfUserGroup={false}
                focusable={true}
                updateFocus={updateFocusSpy}
            />
        );

        messageBubble.container.focus();

        expect(updateFocusSpy).toHaveBeenCalledWith(0);
    });
});
