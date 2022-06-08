import { fireEvent, prettyDOM, render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

import * as genericActions from "../../store/actions/genericActions";
import { AttachFileButton } from "../AttachFileButton";
import { validateFiles } from "../../utils/validateFiles";

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

jest.mock("../../utils/validateFiles", () => ({
    validateFiles: jest.fn()
}));

describe("Attach File Button", () => {
    const dumbFile = { name: "filename.jpg", type: "image/jpeg", size: 1, lastModified: 1 } as File;
    const dumbFile2 = { name: "filename2.jpg", type: "image/jpeg", size: 1, lastModified: 1 } as File;
    const attachIconTitle = "Add file attachment";
    const fileInputSelector = 'input[type="file"]';

    beforeEach(() => {
        (validateFiles as jest.Mock).mockImplementation((files: File[]) => files);
    });

    it("renders the attach file button", () => {
        const { container } = render(<AttachFileButton />);

        expect(container).toBeInTheDocument();
    });

    it("renders the attach file input and icon", () => {
        const { container, queryByTitle } = render(<AttachFileButton />);

        expect(container.querySelector(fileInputSelector)).toBeInTheDocument();
        expect(queryByTitle(attachIconTitle)).toBeInTheDocument();
    });

    it("clicks the file input when button is clicked", () => {
        const { container } = render(<AttachFileButton />);
        const fileInput = container.querySelector(fileInputSelector) as Element;
        const attachFileButton = container.firstChild as Element;

        const inputClickMock = jest.fn();
        fileInput.addEventListener("click", () => inputClickMock());
        fireEvent.click(attachFileButton);

        expect(inputClickMock).toHaveBeenCalled();
    });

    it("attaches the files that are selected via input", () => {
        const attachFilesSpy = jest.spyOn(genericActions, "attachFiles");

        const { container } = render(<AttachFileButton />);
        const fileInput = container.querySelector(fileInputSelector) as Element;
        fireEvent.change(fileInput, {
            target: { files: [dumbFile, dumbFile2] }
        });

        expect(attachFilesSpy).toHaveBeenCalledWith([dumbFile, dumbFile2]);
    });

    it("validates all files that are attached", () => {
        const { container } = render(<AttachFileButton />);
        const fileInput = container.querySelector(fileInputSelector) as Element;
        fireEvent.change(fileInput, {
            target: { files: [dumbFile, dumbFile2] }
        });

        expect(validateFiles).toHaveBeenCalledWith(
            [dumbFile, dumbFile2],
            expect.any(Function),
            [alreadyAttachedFile],
            fileAttachmentConfig
        );
    });

    it("focuses the text area on file select", () => {
        const textAreaRef = {
            current: document.createElement("textarea")
        };

        const { container } = render(
            <>
                <AttachFileButton textAreaRef={textAreaRef} />
                <textarea ref={textAreaRef} />
            </>
        );
        const fileInput = container.querySelector(fileInputSelector) as Element;

        fireEvent.change(fileInput, {
            target: { files: [dumbFile] }
        });

        expect(textAreaRef.current).toHaveFocus();
    });

    it("clears the file input on file select", () => {
        const { container } = render(<AttachFileButton />);
        const fileInput = container.querySelector(fileInputSelector) as Element;

        fireEvent.change(fileInput, {
            target: { files: [dumbFile] }
        });

        expect(fileInput).toHaveValue("");
    });
});
