import { extensions as mimeToExtensions } from "mime-types";
import { Dispatch } from "redux";

import { addNotification } from "../store/actions/genericActions";
import { notifications } from "../notifications";
import { roundFileSizeInMB } from "./roundFileSizeInMB";
import { FileAttachmentConfig } from "../definitions";

/*
 * Validates all provided files and shows an error notification for every invalid file.
 * Returns all valid files.
 */
export const validateFiles = (
    files: File[],
    dispatch: Dispatch,
    attachedFiles?: File[],
    fileAttachmentConfig?: FileAttachmentConfig
): File[] => {
    return files.reduce<File[]>((validFilesAcc, file) => {
        if (
            attachedFiles &&
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
            !mimeToExtensions[file.type].some(
                (type) =>
                    fileAttachmentConfig?.acceptedExtensions &&
                    fileAttachmentConfig.acceptedExtensions.indexOf(type) >= 0
            )
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
};
