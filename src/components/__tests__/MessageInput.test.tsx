import { fireEvent, render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useSelector } from "react-redux";

import { MessageInput } from "../MessageInput";
import * as genericActions from "../../store/actions/genericActions";

const fileAttachmentConfig = {
    enabled: true,
    maxFileSize: 16777216,
    acceptedExtensions: ["jpg", "jpeg", "png", "amr", "mp3", "mp4", "pdf"]
};
const defaultState = {
    config: { fileAttachment: fileAttachmentConfig },
    chat: {
        conversation: { prepareMessage: jest.fn(), setAllMessagesRead: jest.fn(), typing: jest.fn() },
        attachedFiles: []
    }
};
const mockMessageBuilder = {
    setBody: jest.fn(),
    addMedia: jest.fn(),
    build: jest.fn(),
    send: jest.fn()
};

jest.mock("react-redux", () => ({
    useDispatch: () => jest.fn(),
    useSelector: jest.fn()
}));

jest.mock("../FilePreview", () => ({
    FilePreview: ({ file }: { file: File }) => <div title="FilePreview">{file.name}</div>
}));

jest.mock("../AttachFileButton", () => ({
    AttachFileButton: () => <div title="AttachFileButton" />
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FormDataMock(this: any) {
    this.append = jest.fn();
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.FormData = FormDataMock as any;

describe("Message Input", () => {
    const dumbFile = { name: "filename.jpg", type: "image/jpeg", size: 1, lastModified: 1 } as File;
    const dumbFile2 = { name: "filename2.jpg", type: "image/jpeg", size: 1, lastModified: 1 } as File;

    let prepareMessageSpy: jest.SpyInstance;
    let setBodySpy: jest.SpyInstance;
    let addMediaSpy: jest.SpyInstance;
    let buildMessageSpy: jest.SpyInstance;
    let sendMessageSpy: jest.SpyInstance;

    const expectMessageToHaveBeenSentTimes = (times: number) => {
        expect(prepareMessageSpy).toHaveBeenCalledTimes(times);
        expect(setBodySpy).toHaveBeenCalledTimes(times);
        expect(buildMessageSpy).toHaveBeenCalledTimes(times);
        expect(sendMessageSpy).toHaveBeenCalledTimes(times);
    };

    beforeEach(() => {
        (useSelector as jest.Mock).mockImplementation((callback: any) => callback(defaultState));
        prepareMessageSpy = jest
            .spyOn(defaultState.chat.conversation, "prepareMessage")
            .mockImplementation(() => mockMessageBuilder);
        setBodySpy = jest.spyOn(mockMessageBuilder, "setBody").mockImplementation(() => mockMessageBuilder);
        addMediaSpy = jest.spyOn(mockMessageBuilder, "addMedia").mockImplementation(() => mockMessageBuilder);
        buildMessageSpy = jest.spyOn(mockMessageBuilder, "build").mockImplementation(() => mockMessageBuilder);
        sendMessageSpy = jest.spyOn(mockMessageBuilder, "send");
    });

    it("renders the message input", () => {
        const { container } = render(<MessageInput />);

        expect(container).toBeInTheDocument();
    });

    it("renders a file preview for all attached files in message input", () => {
        (useSelector as jest.Mock).mockImplementationOnce((callback: any) =>
            callback({ ...defaultState, chat: { attachedFiles: [dumbFile, dumbFile2] } })
        );

        const { queryByText } = render(<MessageInput />);

        expect(queryByText(dumbFile.name)).toBeInTheDocument();
        expect(queryByText(dumbFile2.name)).toBeInTheDocument();
    });

    it("renders the attach file button if enabled in config", () => {
        const { queryByTitle } = render(<MessageInput />);

        expect(queryByTitle("AttachFileButton")).toBeInTheDocument();
    });

    it("does not render the attach file button if disabled in config", () => {
        (useSelector as jest.Mock).mockImplementationOnce((callback: any) =>
            callback({
                ...defaultState,
                config: { ...defaultState.config, fileAttachment: { ...fileAttachmentConfig, enabled: false } }
            })
        );

        const { queryByTitle } = render(<MessageInput />);

        expect(queryByTitle("AttachFileButton")).not.toBeInTheDocument();
    });

    it("sends message when text is provided by clicking submit button", async () => {
        const { container } = render(<MessageInput />);
        const textArea = container.querySelector("textarea") as Element;
        const submitBtn = container.querySelector('button[type="submit"]') as Element;
        fireEvent.change(textArea, { target: { value: "some text" } });
        fireEvent.click(submitBtn);

        await waitFor(() => expectMessageToHaveBeenSentTimes(1));
    });

    it("sends message when text is provided", async () => {
        const { container } = render(<MessageInput />);
        const textArea = container.querySelector("textarea") as Element;
        fireEvent.change(textArea, { target: { value: "some text" } });
        fireEvent.keyPress(textArea, { key: "Enter", code: "Enter", charCode: 13 });

        await waitFor(() => expectMessageToHaveBeenSentTimes(1));
    });

    it("sends message with provided text", async () => {
        const { container } = render(<MessageInput />);
        const textArea = container.querySelector("textarea") as Element;
        const messageBody = "some text";
        fireEvent.change(textArea, { target: { value: messageBody } });
        fireEvent.keyPress(textArea, { key: "Enter", code: "Enter", charCode: 13 });

        await waitFor(() => {
            expect(setBodySpy).toHaveBeenCalledWith(messageBody);
        });
    });

    it("does not send message on shift+enter keypress", async () => {
        const { container } = render(<MessageInput />);
        const textArea = container.querySelector("textarea") as Element;
        fireEvent.keyPress(textArea, { key: "Enter", code: "Enter", charCode: 13, shiftKey: true });

        await waitFor(() => expectMessageToHaveBeenSentTimes(0));
    });

    it("does not send an empty message", async () => {
        const { container } = render(<MessageInput />);
        const textArea = container.querySelector("textarea") as Element;
        fireEvent.keyPress(textArea, { key: "Enter", code: "Enter", charCode: 13 });

        await waitFor(() => expectMessageToHaveBeenSentTimes(0));
    });

    it("does not send an empty message by clicking submit button", async () => {
        const { container } = render(<MessageInput />);
        const submitBtn = container.querySelector('button[type="submit"]') as Element;
        fireEvent.click(submitBtn);

        await waitFor(() => expectMessageToHaveBeenSentTimes(0));
    });

    it("does not send a message with only whitespace", async () => {
        const { container } = render(<MessageInput />);
        const textArea = container.querySelector("textarea") as Element;
        fireEvent.change(textArea, { target: { value: "      " } });
        fireEvent.keyPress(textArea, { key: "Enter", code: "Enter", charCode: 13 });

        await waitFor(() => expectMessageToHaveBeenSentTimes(0));
    });

    it("does not send duplicate message", async () => {
        const { container } = render(<MessageInput />);
        const textArea = container.querySelector("textarea") as Element;
        fireEvent.change(textArea, { target: { value: "some text" } });
        fireEvent.keyPress(textArea, { key: "Enter", code: "Enter", charCode: 13 });
        fireEvent.keyPress(textArea, { key: "Enter", code: "Enter", charCode: 13 });

        await waitFor(() => expectMessageToHaveBeenSentTimes(1));
    });

    it("sends message with attached files", async () => {
        (useSelector as jest.Mock).mockImplementationOnce((callback: any) =>
            callback({ ...defaultState, chat: { ...defaultState.chat, attachedFiles: [dumbFile, dumbFile2] } })
        );

        const { container } = render(<MessageInput />);
        const textArea = container.querySelector("textarea") as Element;
        fireEvent.keyPress(textArea, { key: "Enter", code: "Enter", charCode: 13 });

        await waitFor(() => {
            expect(addMediaSpy).toHaveBeenCalledTimes(2);
            expectMessageToHaveBeenSentTimes(1);
        });
    });

    it("focuses message input after send", async () => {
        const { container } = render(<MessageInput />);
        const textArea = container.querySelector("textarea") as Element;
        fireEvent.change(textArea, { target: { value: "some text" } });
        fireEvent.keyPress(textArea, { key: "Enter", code: "Enter", charCode: 13 });

        await waitFor(() => {
            expect(textArea).toHaveFocus();
        });
    });

    it("clears message input value after send", async () => {
        const { container } = render(<MessageInput />);
        const textArea = container.querySelector("textarea") as Element;
        fireEvent.change(textArea, { target: { value: "some text" } });
        fireEvent.keyPress(textArea, { key: "Enter", code: "Enter", charCode: 13 });

        await waitFor(() => {
            expect(textArea).toHaveValue("");
        });
    });

    it("detaches all attached files when message sent", async () => {
        (useSelector as jest.Mock).mockImplementationOnce((callback: any) =>
            callback({ ...defaultState, chat: { ...defaultState.chat, attachedFiles: [dumbFile, dumbFile2] } })
        );
        const detachFilesSpy = jest.spyOn(genericActions, "detachFiles");

        const { container } = render(<MessageInput />);
        const textArea = container.querySelector("textarea") as Element;
        fireEvent.keyPress(textArea, { key: "Enter", code: "Enter", charCode: 13 });

        await waitFor(() => {
            expect(detachFilesSpy).toHaveBeenCalledWith([dumbFile, dumbFile2]);
        });
    });

    it("sets message input rows to 1 on render", () => {
        const { container } = render(<MessageInput />);
        const textArea = container.querySelector("textarea");

        expect(textArea).toHaveAttribute("rows", "1");
    });

    it("focuses message input on render", () => {
        const { container } = render(<MessageInput />);
        const textArea = container.querySelector("textarea");

        expect(textArea).toHaveFocus();
    });

    it("sets all messages read on render", () => {
        const setAllMessagesReadSpy = jest.spyOn(defaultState.chat.conversation, "setAllMessagesRead");

        render(<MessageInput />);

        expect(setAllMessagesReadSpy).toHaveBeenCalled();
    });

    it("sets all messages read when current user is typing and there are unread messages", () => {
        const setAllMessagesReadSpy = jest.spyOn(defaultState.chat.conversation, "setAllMessagesRead");
        (useSelector as jest.Mock).mockImplementationOnce((callback: any) =>
            callback({
                ...defaultState,
                chat: {
                    ...defaultState.chat,
                    conversation: {
                        ...defaultState.chat.conversation,
                        lastReadMessageIndex: 0,
                        lastMessage: { index: 1 }
                    }
                }
            })
        );

        const { container } = render(<MessageInput />);
        const textArea = container.querySelector("textarea") as Element;
        fireEvent.change(textArea, { target: { value: "random message" } });

        expect(setAllMessagesReadSpy).toHaveBeenCalledTimes(2); // once for focus() on initial load and once for while typing
    });

    it("sets user as typing when current user is typing", () => {
        const typingSpy = jest.spyOn(defaultState.chat.conversation, "typing");

        const { container } = render(<MessageInput />);
        const textArea = container.querySelector("textarea") as Element;
        fireEvent.change(textArea, { target: { value: "random message" } });

        expect(typingSpy).toHaveBeenCalled();
    });

    it("message input has character limit", () => {
        const { container } = render(<MessageInput />);
        const textArea = container.querySelector("textarea") as HTMLTextAreaElement;
        const charLimit = 1024 * 32;

        expect(textArea).toHaveAttribute("maxLength", charLimit.toString());
    });
});
