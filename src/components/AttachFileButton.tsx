import { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@twilio-paste/core/button";
import { AttachIcon } from "@twilio-paste/icons/esm/AttachIcon";
import { extension as mimeToExtension } from "mime-types";

import { AppState } from "../store/definitions";
import { addNotification, attachFiles } from "../store/actions/genericActions";
import { notifications } from "../notifications";
import { roundFileSizeInMB } from "../utils/roundFileSizeInMB";
import { hiddenInputStyles } from "./styles/AttachFileButton.styles";

export const AttachFileButton = () => {
    const fileInputRef: React.RefObject<HTMLInputElement> = useRef(null);
    const { attachedFiles, fileAttachmentConfig } = useSelector((state: AppState) => ({
        attachedFiles: state.chat.attachedFiles || [],
        fileAttachmentConfig: state.config.fileAttachment
    }));

    const dispatch = useDispatch();

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files && Array.from(event.target.files);
        if (selectedFiles) {
            const validFiles = selectedFiles.reduce<File[]>((validFilesAcc, file) => {
                if (
                    attachedFiles.some(
                        (attachedFile) =>
                            file.name === attachedFile.name &&
                            file.type === attachedFile.type &&
                            file.size === attachedFile.size
                    )
                ) {
                    dispatch(
                        addNotification(
                            notifications.fileAttachmentAlreadyAttachedNotification({
                                fileName: file.name
                            })
                        )
                    );
                } else if (fileAttachmentConfig?.maxFileSize && file.size > fileAttachmentConfig.maxFileSize) {
                    dispatch(
                        addNotification(
                            notifications.fileAttachmentInvalidSizeNotification({
                                fileName: file.name,
                                maxFileSize: `${roundFileSizeInMB(fileAttachmentConfig?.maxFileSize)}MB`
                            })
                        )
                    );
                } else if (
                    fileAttachmentConfig?.acceptedExtensions &&
                    !fileAttachmentConfig.acceptedExtensions.includes(mimeToExtension(file.type) as string)
                ) {
                    dispatch(
                        addNotification(
                            notifications.fileAttachmentInvalidTypeNotification({
                                fileName: file.name
                            })
                        )
                    );
                } else {
                    validFilesAcc.push(file);
                }

                return validFilesAcc;
            }, []);

            dispatch(attachFiles(validFiles));
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
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
            />
            <AttachIcon decorative={false} title="Add file attachment" />
        </Button>
    );
};
