import { Notification } from "./store/definitions";

/*
 * const exampleNotification: Notification = {
 *     id: "ExampleNotification",
 *     dismissible: true,
 *     message: "Example notification",
 *     type: "neutral"
 * };
 */

const shortenFileName = (string: string, maxChar = 50) => {
    const [, filename, fileExtension] = string.match(/^(.+)(\.[\S]*)$/) || [];

    return `${filename.substr(0, maxChar)}[...]${fileExtension || ""}`;
};

const fileAttachmentAlreadyAttachedNotification = ({ fileName }: { fileName: string }): Notification => ({
    id: `FileAttachmentAlreadyAttachedNotification_${Math.random()}`,
    dismissible: true,
    message: `${shortenFileName(fileName)} is already attached.`,
    type: "error",
    timeout: 10000
});

const fileAttachmentInvalidSizeNotification = ({
    fileName,
    maxFileSize
}: {
    fileName: string;
    maxFileSize: string;
}): Notification => ({
    id: `FileAttachmentInvalidSizeNotification_${Math.random()}`,
    dismissible: true,
    message: `${shortenFileName(
        fileName
    )} can’t be attached because the file is too large. Maximum file size is ${maxFileSize}`,
    type: "error",
    timeout: 10000
});

const fileAttachmentInvalidTypeNotification = ({ fileName }: { fileName: string }): Notification => ({
    id: `FileAttachmentInvalidTypeNotification_${Math.random()}`,
    dismissible: true,
    message: `${shortenFileName(
        fileName
    )} can’t be attached because that file type isn’t supported. Please try a different file.`,
    type: "error",
    timeout: 10000
});

const fileDownloadInvalidSizeNotification = ({
    fileName,
    maxFileSize
}: {
    fileName: string;
    maxFileSize: string;
}): Notification => ({
    id: `FileDownloadInvalidSizeNotification_${Math.random()}`,
    dismissible: true,
    message: `${shortenFileName(
        fileName
    )} can’t be downloaded because the file is too large. Maximum file size is ${maxFileSize}`,
    type: "error",
    timeout: 10000
});

const fileDownloadInvalidTypeNotification = ({ fileName }: { fileName: string }): Notification => ({
    id: `FileDownloadInvalidTypeNotification_${Math.random()}`,
    dismissible: true,
    message: `${shortenFileName(fileName)} can’t be downloaded because the file type isn’t supported.`,
    type: "error",
    timeout: 10000
});

const noConnectionNotification = (): Notification => ({
    id: "NoConnectionNotification",
    dismissible: true,
    message: "Connection lost. Attempting to reconnect.",
    type: "warning"
});

const failedToInitSessionNotification = (error: string): Notification => ({
    id: `FailedToInitSessionNotification`,
    dismissible: true,
    message: `Something went wrong. ${error}. Please try again later.`,
    type: "error"
});

export const notifications = {
    fileAttachmentAlreadyAttachedNotification,
    fileAttachmentInvalidSizeNotification,
    fileAttachmentInvalidTypeNotification,
    fileDownloadInvalidSizeNotification,
    fileDownloadInvalidTypeNotification,
    noConnectionNotification,
    failedToInitSessionNotification
};
