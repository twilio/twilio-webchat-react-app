import { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@twilio-paste/core/button";
import { AttachIcon } from "@twilio-paste/icons/esm/AttachIcon";

import { AppState } from "../store/definitions";
import { hiddenInputStyles } from "./styles/AttachFileButton.styles";
import { validateFiles } from "../utils/validateFiles";
import { attachFiles } from "../store/actions/genericActions";

export const AttachFileButton = ({ textAreaRef }: { textAreaRef?: React.RefObject<HTMLTextAreaElement> }) => {
    const fileInputRef: React.RefObject<HTMLInputElement> = useRef(null);
    const { attachedFiles, fileAttachmentConfig } = useSelector((state: AppState) => ({
        attachedFiles: state.chat.attachedFiles || [],
        fileAttachmentConfig: state.config.fileAttachment
    }));

    const dispatch = useDispatch();

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files && Array.from(event.target.files);
        if (selectedFiles) {
            const validFiles = validateFiles(selectedFiles, dispatch, attachedFiles, fileAttachmentConfig);
            dispatch(attachFiles(validFiles));
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        textAreaRef?.current?.focus();
    };

    return (
        <Button variant="secondary_icon" size="icon_small" onClick={() => fileInputRef.current?.click()}>
            <input
                style={hiddenInputStyles}
                onChange={onFileChange}
                type="file"
                accept={
                    fileAttachmentConfig?.acceptedExtensions &&
                    fileAttachmentConfig.acceptedExtensions.map((e) => `.${e}`).join(",")
                }
                ref={fileInputRef}
                multiple
            />
            <AttachIcon decorative={false} title="Add file attachment" />
        </Button>
    );
};
