import { extension as mimeToExtension } from "mime-types";
import { Dispatch } from "redux";

import { addNotification } from "../store/actions/genericActions";
import { notifications } from "../notifications";
import { roundFileSizeInMB } from "./roundFileSizeInMB";
import { FileAttachmentConfig } from "../definitions";

const MAX_DISPLAYED_CHAR_FOR_FIRST_PART = 14;
const MAX_DISPLAYED_CHAR_FOR_SECOND_PART = 5;

export const shortenFileName = (name: string, maxChar = 20) => {
    const [, filename, fileExtension] = name.match(/^(.+)(\.[\S]*)$/) || [];
    if (!filename) {
        return name;
    }

    if (filename.length <= maxChar) return name;

    return `${filename.substring(0, MAX_DISPLAYED_CHAR_FOR_FIRST_PART)}[...]${filename.substring(
        filename.length - MAX_DISPLAYED_CHAR_FOR_SECOND_PART
    )}${fileExtension}`;
};

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
};
