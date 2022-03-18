import { fireEvent, render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import * as genericActions from "../../store/actions/genericActions";
import { notifications } from "../../notifications";
import { AttachFileButton } from "../AttachFileButton";
import { matchPartialNotificationObject } from "../../test-utils";

const fileAttachmentConfig = {
    enabled: true,
    maxFileSize: 16777216,
    acceptedExtensions: ["jpg", "jpeg", "png", "amr", "mp3", "mp4", "pdf"]
};
const alreadyAttachedFile = { name: "filenameAttached.jpg", type: "image/png", size: 1, lastModified: 1 } as File;

jest.mock("react-redux", () => ({
    useDispatch: () => jest.fn(),
    useSelector: (callback: any) =>
        callback({
            config: { fileAttachment: fileAttachmentConfig },
            chat: { attachedFiles: [alreadyAttachedFile] }
        })
}));

describe("Attach File Button", () => {
    const dumbFile = { name: "filename.jpg", type: "image/jpeg", size: 1, lastModified: 1 } as File;
    const dumbFile2 = { name: "filename2.jpg", type: "image/jpeg", size: 1, lastModified: 1 } as File;
    const attachIconTitle = "Add file attachment";
    const fileInputSelector = 'input[type="file"]';

    it("renders the attach file button", () => {
        const { container } = render(<AttachFileButton />);

        expect(container).toBeInTheDocument();
    });

    it("renders the attach file input and icon", () => {
        const { container, queryByTitle } = render(<AttachFileButton />);

        expect(container.querySelector(fileInputSelector)).toBeInTheDocument();
        expect(queryByTitle(attachIconTitle)).toBeInTheDocument();
    });

    it("clicks the file input when button is clicked", async () => {
        const { container } = render(<AttachFileButton />);
        const fileInput = container.querySelector(fileInputSelector) as Element;
        const attachFileButton = container.firstChild as Element;

        const inputClickMock = jest.fn();
        fileInput.addEventListener("click", () => inputClickMock());
        fireEvent.click(attachFileButton);

        expect(inputClickMock).toHaveBeenCalled();
    });

    it("attaches the files that are selected via input", async () => {
        const attachFilesSpy = jest.spyOn(genericActions, "attachFiles");

        const { container } = render(<AttachFileButton />);
        const fileInput = container.querySelector(fileInputSelector) as Element;
        await waitFor(() =>
            fireEvent.change(fileInput, {
                target: { files: [dumbFile, dumbFile2] }
            })
        );

        expect(attachFilesSpy).toHaveBeenCalledWith([dumbFile, dumbFile2]);
    });

    it("clears the file input on file select", async () => {
        const { container } = render(<AttachFileButton />);
        const fileInput = container.querySelector(fileInputSelector) as Element;

        await waitFor(() =>
            fireEvent.change(fileInput, {
                target: { files: [dumbFile] }
            })
        );

        expect(fileInput).toHaveValue("");
    });

    it("does not attach a file that is already attached", async () => {
        const addNotificationSpy = jest.spyOn(genericActions, "addNotification");

        const { container } = render(<AttachFileButton />);
        const fileInput = container.querySelector(fileInputSelector) as Element;
        await waitFor(() =>
            fireEvent.change(fileInput, {
                target: { files: [alreadyAttachedFile] }
            })
        );

        expect(addNotificationSpy).toHaveBeenCalledWith(
            matchPartialNotificationObject(
                notifications.fileAttachmentAlreadyAttachedNotification({ fileName: alreadyAttachedFile.name })
            )
        );
    });

    it("does not attach a file with invalid file size", async () => {
        const addNotificationSpy = jest.spyOn(genericActions, "addNotification");

        const { container } = render(<AttachFileButton />);
        const fileInput = container.querySelector(fileInputSelector) as Element;
        await waitFor(() =>
            fireEvent.change(fileInput, {
                target: { files: [{ ...dumbFile, size: 999999999 }] }
            })
        );

        expect(addNotificationSpy).toHaveBeenCalledWith(
            matchPartialNotificationObject(
                notifications.fileAttachmentInvalidSizeNotification({ fileName: dumbFile.name, maxFileSize: "16.0MB" })
            )
        );
    });

    it("does not attach a file with invalid file type", async () => {
        const addNotificationSpy = jest.spyOn(genericActions, "addNotification");

        const { container } = render(<AttachFileButton />);
        const fileInput = container.querySelector(fileInputSelector) as Element;
        await waitFor(() =>
            fireEvent.change(fileInput, {
                target: { files: [{ ...dumbFile, type: "unknown/type" }] }
            })
        );

        expect(addNotificationSpy).toHaveBeenCalledWith(
            matchPartialNotificationObject(
                notifications.fileAttachmentInvalidTypeNotification({ fileName: dumbFile.name })
            )
        );
    });
});
