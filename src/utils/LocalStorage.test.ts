import { LocalStorageUtil } from "./LocalStorage";

describe("LocalStorage Util", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should throw an error if the data is not a valid JSON", () => {
        jest.spyOn(Object.getPrototypeOf(window.localStorage), "getItem").mockReturnValueOnce("val");
        expect(LocalStorageUtil.get("test")).toBe("val");
    });
});