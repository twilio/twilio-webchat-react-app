import "@testing-library/jest-dom";

import { shortenFileName, validateFiles } from "./file";
import { matchPartialNotificationObject } from "../test-utils";
import { notifications } from "../notifications";
import * as genericActions from "../store/actions/genericActions";

const fileAttachmentConfig = {
    enabled: true,
    maxFileSize: 16777216,
    acceptedExtensions: ["jpg", "jpeg", "png", "amr", "mp3", "mp4", "pdf"]
};
const dumbFile = { name: "filename.jpg", type: "image/jpeg", size: 1, lastModified: 1 } as File;
const alreadyAttachedFile = { name: "filenameAttached.jpg", type: "image/png", size: 1, lastModified: 1 } as File;
const mockDispatch = jest.fn();

describe("file utility", () => {
    describe("file name shortening", () => {
        it("should shorten filename if the filename char is too long", () => {
            const longFileName = "Profile-20230724T08574.txt";
            const truncatedName = shortenFileName(longFileName);
            expect(truncatedName).toBe("Profile-202307[...]08574.txt");
        });
    
        it("should return the filename as is, if the filename charachter length is less than 20 characters", () => {
            const shortName = "Profile.txt";
            const name = shortenFileName(shortName);
            expect(name).toBe(shortName);
        });
    
        it("should show the filename as it is, if the filename length is of 20 characters", () => {
            const filename = "Profile-20230724T085.txt";
            expect(shortenFileName(filename)).toBe(filename);
        });
    
        it("should not show the file extension if there's no regex match", () => {
            const filename = "Profile20230724T085";
            expect(shortenFileName(filename)).toBe(filename);
        });
    });

    describe("validateFiles", () => {
        it("does not validate a file that is already attached", () => {
            const addNotificationSpy = jest.spyOn(genericActions, "addNotification");
    
            const validFiles = validateFiles(
                [alreadyAttachedFile],
                mockDispatch,
                [alreadyAttachedFile],
                fileAttachmentConfig
            );
    
            expect(validFiles).toHaveLength(0);
            expect(addNotificationSpy).toHaveBeenCalledWith(
                matchPartialNotificationObject(
                    notifications.fileAttachmentAlreadyAttachedNotification({ fileName: alreadyAttachedFile.name })
                )
            );
        });
    
        it("does not validate a file with invalid file size", () => {
            const addNotificationSpy = jest.spyOn(genericActions, "addNotification");
    
            const validFiles = validateFiles(
                [{ ...dumbFile, size: 999999999 } as File],
                mockDispatch,
                [alreadyAttachedFile],
                fileAttachmentConfig
            );
    
            expect(validFiles).toHaveLength(0);
            expect(addNotificationSpy).toHaveBeenCalledWith(
                matchPartialNotificationObject(
                    notifications.fileAttachmentInvalidSizeNotification({ fileName: dumbFile.name, maxFileSize: "16.0MB" })
                )
            );
        });
    
        it("does not validate a file with invalid file type", () => {
            const addNotificationSpy = jest.spyOn(genericActions, "addNotification");
    
            const validFiles = validateFiles(
                [{ ...dumbFile, type: "unknown/type" } as File],
                mockDispatch,
                [alreadyAttachedFile],
                fileAttachmentConfig
            );
    
            expect(validFiles).toHaveLength(0);
            expect(addNotificationSpy).toHaveBeenCalledWith(
                matchPartialNotificationObject(
                    notifications.fileAttachmentInvalidTypeNotification({ fileName: dumbFile.name })
                )
            );
        });
    });
});
