import { fireEvent, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Media } from "@twilio/conversations";

import { FilePreview } from "../FilePreview";
import * as genericActions from "../../store/actions/genericActions";
import { notifications } from "../../notifications";
import { matchPartialNotificationObject } from "../../test-utils";

const fileAttachmentConfig = {
    enabled: true,
    maxFileSize: 16777216,
    acceptedExtensions: ["jpg", "jpeg", "png", "amr", "mp3", "mp4", "pdf"]
};

jest.mock("react-redux", () => ({
    useDispatch: () => jest.fn(),
    useSelector: (callback: any) => callback({ config: { fileAttachment: fileAttachmentConfig } })
}));

describe("File Preview", () => {
    const dumbFile = { name: "filename.jpg", type: "image/jpeg", size: 1, lastModified: 1 } as File;
    const dumbMedia = {
        getContentTemporaryUrl: async () => "url",
        filename: "filename.jpg",
        contentType: "image/jpeg",
        size: 1
    } as Media;
    const fileIconTitle = "File attachment";
    const closeIconTitle = "Remove file attachment";
    const fileButtonMainAreaSelector = `[data-test="file-preview-main-area"]`;

    it("renders the file preview", () => {
        const { container } = render(<FilePreview file={dumbFile} isBubble={false} focusable={false} />);

        expect(container).toBeInTheDocument();
    });

    it("renders the file icon", () => {
        const { queryByTitle } = render(<FilePreview file={dumbFile} isBubble={false} focusable={false} />);
        const fileIcon = queryByTitle(fileIconTitle);

        expect(fileIcon).toBeInTheDocument();
    });

    it("renders the file name", () => {
        const { queryByText } = render(<FilePreview file={dumbFile} isBubble={false} focusable={false} />);

        expect(queryByText(dumbFile.name)).toBeInTheDocument();
    });

    it("renders the close button and icon if in message input", () => {
        const { queryByTitle } = render(<FilePreview file={dumbFile} isBubble={false} focusable={false} />);
        const closeIcon = queryByTitle(closeIconTitle) as Element;
        const closeButton = closeIcon.parentElement as Element;

        expect(closeIcon).toBeInTheDocument();
        expect(closeButton.parentElement).toBeInTheDocument();
    });

    it("does not render the close icon if in message bubble", () => {
        const { queryByTitle } = render(<FilePreview file={dumbFile} isBubble={true} focusable={false} />);
        const closeIcon = queryByTitle(closeIconTitle) as Element;

        expect(closeIcon).not.toBeInTheDocument();
    });

    it("detaches the file when file preview is clicked in message input", () => {
        const detachFilesSpy = jest.spyOn(genericActions, "detachFiles");

        const { queryByTitle } = render(<FilePreview file={dumbFile} isBubble={false} focusable={false} />);
        const closeIcon = queryByTitle(closeIconTitle) as Element;
        const closeButton = closeIcon.parentElement as Element;
        fireEvent.click(closeButton);

        expect(detachFilesSpy).toHaveBeenCalledWith([dumbFile]);
    });

    it("downloads the file when file preview is clicked in message bubble", async () => {
        jest.spyOn(dumbMedia, "getContentTemporaryUrl");
        window.open = jest.fn();

        const { container } = render(
            <FilePreview file={dumbFile} isBubble={true} media={dumbMedia} focusable={false} />
        );
        const outerBox = container.querySelector(fileButtonMainAreaSelector) as Element;
        fireEvent.click(outerBox);

        expect(window.open).toHaveBeenCalledWith(await dumbMedia.getContentTemporaryUrl());
    });

    it("does not download the file when file preview is clicked in message bubble and invalid file size", async () => {
        window.open = jest.fn();
        const addNotificationSpy = jest.spyOn(genericActions, "addNotification");

        const { container } = render(
            <FilePreview file={{ ...dumbFile, size: 999999999 }} isBubble={true} media={dumbMedia} focusable={false} />
        );
        const outerBox = container.querySelector(fileButtonMainAreaSelector) as Element;
        fireEvent.click(outerBox);

        expect(window.open).not.toHaveBeenCalled();
        expect(addNotificationSpy).toHaveBeenCalledWith(
            matchPartialNotificationObject(
                notifications.fileDownloadInvalidSizeNotification({ fileName: dumbFile.name, maxFileSize: "16.0MB" })
            )
        );
    });

    it("does not download the file when file preview is clicked in message bubble and invalid file type", async () => {
        window.open = jest.fn();
        const addNotificationSpy = jest.spyOn(genericActions, "addNotification");

        const { container } = render(
            <FilePreview
                file={{ ...dumbFile, type: "unknown/type" }}
                isBubble={true}
                media={dumbMedia}
                focusable={false}
            />
        );
        const outerBox = container.querySelector(fileButtonMainAreaSelector) as Element;
        fireEvent.click(outerBox);

        expect(window.open).not.toHaveBeenCalled();
        expect(addNotificationSpy).toHaveBeenCalledWith(
            matchPartialNotificationObject(
                notifications.fileDownloadInvalidTypeNotification({ fileName: dumbMedia.filename })
            )
        );
    });

    it.each([
        {
            sizeInBytes: 1048.58, // 0.001 MB
            displayInMegaBytes: "0.01MB"
        },
        {
            sizeInBytes: 10485.76, // 0.01 MB
            displayInMegaBytes: "0.01MB"
        },
        {
            sizeInBytes: 104857.6, // 0.1 MB
            displayInMegaBytes: "0.10MB"
        },
        {
            sizeInBytes: 1048576, // 1 MB
            displayInMegaBytes: "1.00MB"
        },
        {
            sizeInBytes: 10485760, // 10 MB
            displayInMegaBytes: "10.0MB"
        },
        {
            sizeInBytes: 104857600, // 100 MB
            displayInMegaBytes: "100MB"
        }
    ])("displays correctly rounded file size", async ({ sizeInBytes, displayInMegaBytes }) => {
        const { container } = render(
            <FilePreview file={{ ...dumbFile, size: sizeInBytes }} isBubble={false} focusable={false} />
        );
        const filesizeText = container.querySelector("p");

        expect(filesizeText).toHaveTextContent(displayInMegaBytes);
    });

    describe("Mouse Events", () => {
        const fileSize = "0.01MB";
        const clickToOpenText = "Click to open";

        it("renders the file size if not hovered", () => {
            const { container, queryByText } = render(
                <FilePreview file={dumbFile} isBubble={false} focusable={false} />
            );
            const outerBox = container.querySelector(fileButtonMainAreaSelector) as Element;

            fireEvent.mouseEnter(outerBox);
            fireEvent.mouseLeave(outerBox);

            expect(queryByText(fileSize)).toBeInTheDocument();
            expect(queryByText(clickToOpenText)).not.toBeInTheDocument();
        });

        it("renders click to open text if hovered", () => {
            const { container, queryByText } = render(
                <FilePreview file={dumbFile} isBubble={false} focusable={false} />
            );
            const outerBox = container.querySelector(fileButtonMainAreaSelector) as Element;

            fireEvent.mouseEnter(outerBox);

            expect(queryByText(clickToOpenText)).toBeInTheDocument();
            expect(queryByText(fileSize)).not.toBeInTheDocument();
        });

        it("renders click to open text if focused", () => {
            const { container, queryByText } = render(
                <FilePreview file={dumbFile} isBubble={false} focusable={false} />
            );
            const outerBox = container.querySelector(fileButtonMainAreaSelector) as Element;

            fireEvent.focus(outerBox);

            expect(queryByText(clickToOpenText)).toBeInTheDocument();
            expect(queryByText(fileSize)).not.toBeInTheDocument();
        });

        it("renders file size if blurred from focus", () => {
            const { container, queryByText } = render(
                <FilePreview file={dumbFile} isBubble={false} focusable={false} />
            );
            const outerBox = container.querySelector(fileButtonMainAreaSelector) as Element;

            fireEvent.focus(outerBox);
            fireEvent.blur(outerBox);

            expect(queryByText(fileSize)).toBeInTheDocument();
            expect(queryByText(clickToOpenText)).not.toBeInTheDocument();
        });
    });
});
