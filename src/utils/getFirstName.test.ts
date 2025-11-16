import { getFirstName } from "./getFirstName";

describe("getFirstName", () => {
    it("should return the first name from a full name", () => {
        expect(getFirstName("John Smith")).toBe("John");
        expect(getFirstName("Mary Jane Watson")).toBe("Mary");
        expect(getFirstName("Dr. Robert Johnson")).toBe("Dr.");
    });

    it("should return the original name if it's a single word", () => {
        expect(getFirstName("John")).toBe("John");
        expect(getFirstName("Agent")).toBe("Agent");
    });

    it("should handle names with multiple spaces", () => {
        expect(getFirstName("John  Smith")).toBe("John");
        expect(getFirstName("  Mary   Jane  ")).toBe("Mary");
    });

    it("should handle empty or undefined names", () => {
        expect(getFirstName("")).toBe("");
        expect(getFirstName(undefined)).toBe("");
    });

    it("should handle special characters", () => {
        expect(getFirstName("José García")).toBe("José");
        expect(getFirstName("O'Connor Smith")).toBe("O'Connor");
    });
});
