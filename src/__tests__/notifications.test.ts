import { notifications } from "../notifications";
describe("notifications", () => {
    it("should shorten filename if the filename char is too long", () => {
        const longFileName = "Profile-20230724T08574.txt";
        const truncatedName = notifications.shortenFileName(longFileName);
        expect(truncatedName).toBe("Profile-202307[...]T0857.txt");
    });

    it("should return the filename as is, if the filename charachter length is less than 20 characters", () => {
        const shortName = "Profile.txt";
        const name = notifications.shortenFileName(shortName);
        expect(name).toBe(shortName);
    });
});
