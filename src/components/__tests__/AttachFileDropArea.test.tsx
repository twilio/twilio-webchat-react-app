import { fireEvent, render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import * as genericActions from "../../store/actions/genericActions";
import { AttachFileDropArea } from "../AttachFileDropArea";

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

jest.mock("@twilio-paste/icons/esm/AttachIcon", () => ({
    AttachIcon: () => <div title="AttachIcon" />
}));

describe("Attach File Drop Area", () => {
    const dumbFile = { name: "filename.jpg", type: "image/jpeg", size: 1, lastModified: 1 } as File;
    const dumbFile2 = { name: "filename2.jpg", type: "image/jpeg", size: 1, lastModified: 1 } as File;

    it("renders the attach file drop area", () => {
        const { container } = render(
            <AttachFileDropArea>
                <></>
            </AttachFileDropArea>
        );

        expect(container).toBeInTheDocument();
    });

    it("attaches files that are drag and dropped", () => {
        const attachFilesSpy = jest.spyOn(genericActions, "attachFiles");

        const { container } = render(
            <AttachFileDropArea>
                <></>
            </AttachFileDropArea>
        );
        const dropArea = container.firstChild as Element;
        fireEvent.drop(dropArea, {
            dataTransfer: { files: [dumbFile, dumbFile2], types: ["Files"] }
        });

        expect(attachFilesSpy).toHaveBeenCalledWith([dumbFile, dumbFile2]);
    });

    it("renders attach file icon when file dragged over drop area", () => {
        const { container, queryByTitle } = render(
            <AttachFileDropArea>
                <></>
            </AttachFileDropArea>
        );
        const dropArea = container.firstChild as Element;
        fireEvent.dragOver(dropArea, {
            dataTransfer: { files: [dumbFile], types: ["Files"] }
        });
        const attachIcon = queryByTitle("AttachIcon");

        expect(attachIcon).toBeInTheDocument();
    });

    it("doesn't render attach file icon when non-file dragged over drop area", () => {
        const { container, queryByTitle } = render(
            <AttachFileDropArea>
                <></>
            </AttachFileDropArea>
        );
        const dropArea = container.firstChild as Element;
        fireEvent.dragOver(dropArea, {
            dataTransfer: { files: [{}], types: ["NonFiles"] }
        });
        const attachIcon = queryByTitle("AttachIcon");

        expect(attachIcon).not.toBeInTheDocument();
    });

    it("doesn't render attach file icon when file dragged away from drop area", () => {
        const { container, queryByTitle } = render(
            <AttachFileDropArea>
                <></>
            </AttachFileDropArea>
        );
        const dropArea = container.firstChild as Element;
        fireEvent.dragLeave(dropArea, {
            dataTransfer: { files: [dumbFile], types: ["Files"] }
        });
        const attachIcon = queryByTitle("AttachIcon");

        expect(attachIcon).not.toBeInTheDocument();
    });
});
