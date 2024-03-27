import { notifications } from "../notifications";
describe("notifications", () => {
    it("should shorten filename if the filename char is too long", () => {
        const longFileName = "Profile-20230724T08574.txt";
        const truncatedName = notifications.shortenFileName(longFileName);
        expect(truncatedName).toBe("Profile-202307[...]08574.txt");
    });

    it("should return the filename as is, if the filename charachter length is less than 20 characters", () => {
        const shortName = "Profile.txt";
        const name = notifications.shortenFileName(shortName);
        expect(name).toBe(shortName);
    });

    it("should show the filename as it is, if the filename length is of 20 characters", () => {
        const filename = "Profile-20230724T085.txt";
        expect(notifications.shortenFileName(filename)).toBe(filename);
    });

    it("should not show the file extension if there's no regex match", () => {
        const filename = "Profile20230724T085";
        expect(notifications.shortenFileName(filename)).toBe(filename);
    });
});
