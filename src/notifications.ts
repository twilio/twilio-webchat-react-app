import { I18n } from "./i18n/i18n.interface";
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

export type Notifications = {
    fileAttachmentAlreadyAttachedNotification: ({ fileName }: { fileName: string }) => Notification;
    fileAttachmentInvalidSizeNotification: ({
        fileName,
        maxFileSize
    }: {
        fileName: string;
        maxFileSize: string;
    }) => Notification;
    fileAttachmentInvalidTypeNotification: ({ fileName }: { fileName: string }) => Notification;
    fileDownloadInvalidSizeNotification: ({
        fileName,
        maxFileSize
    }: {
        fileName: string;
        maxFileSize: string;
    }) => Notification;
    fileDownloadInvalidTypeNotification: ({ fileName }: { fileName: string }) => Notification;
    noConnectionNotification: () => Notification;
    failedToInitSessionNotification: (error: string) => Notification;
};

export const moduleNotifications = (i18n: I18n): Notifications => {
    const fileAttachmentAlreadyAttachedNotification = ({ fileName }: { fileName: string }): Notification => ({
        id: `FileAttachmentAlreadyAttachedNotification_${Math.random()}`,
        dismissible: true,
        message: `${shortenFileName(fileName)} ${i18n.notificationFileAttachmentAlreadyAttached}`,
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
        message: `${shortenFileName(fileName)} ${i18n.notificationFileDownloadSizeExceeded} ${maxFileSize}`,
        type: "error",
        timeout: 10000
    });

    const fileAttachmentInvalidTypeNotification = ({ fileName }: { fileName: string }): Notification => ({
        id: `FileAttachmentInvalidTypeNotification_${Math.random()}`,
        dismissible: true,
        message: `${shortenFileName(fileName)} ${i18n.notificationFileAttachmentTypeNotSupported}`,
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
        message: `${shortenFileName(fileName)} ${i18n.notificationFileDownloadSizeExceeded} ${maxFileSize}`,
        type: "error",
        timeout: 10000
    });

    const fileDownloadInvalidTypeNotification = ({ fileName }: { fileName: string }): Notification => ({
        id: `FileDownloadInvalidTypeNotification_${Math.random()}`,
        dismissible: true,
        message: `${shortenFileName(fileName)} ${i18n.notificationFileDownloadTypeNotSupported}`,
        type: "error",
        timeout: 10000
    });

    const noConnectionNotification = (): Notification => ({
        id: "NoConnectionNotification",
        dismissible: true,
        message: i18n.notificationNoConnection,
        type: "warning"
    });

    const failedToInitSessionNotification = (error: string): Notification => ({
        id: `FailedToInitSessionNotification`,
        dismissible: true,
        message: `${i18n.notificationSomethingWentWrong} ${error}. ${i18n.notificationPleaseTryAgain}`,
        type: "error"
    });
    return {
        fileAttachmentAlreadyAttachedNotification,
        fileAttachmentInvalidSizeNotification,
        fileAttachmentInvalidTypeNotification,
        fileDownloadInvalidSizeNotification,
        fileDownloadInvalidTypeNotification,
        noConnectionNotification,
        failedToInitSessionNotification
    };
};
