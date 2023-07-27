import { act } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { useSanitizer } from "./useSanitizer";
import validator from "validator";
describe("useSanitizer custom hook", () => {
    it("should set the default state on render", () => {
        const { result } = renderHook(() => useSanitizer());

        expect(result.current.userInput).toBe('');
    });

    it("should update the local state of the hook after input sanitization", () => {
        const { result } = renderHook(() => useSanitizer());

        act(() => {
            result.current.onUserInputSubmit("newText");
        });

        expect(result.current.userInput).toBe("newText");
    });

    it("should escape unwanted characters", () => {
        const blackListSpy = jest.spyOn(validator, "blacklist");
        const { result } = renderHook(() => useSanitizer());

        act(() => {
            result.current.onUserInputSubmit("<script>alert('Hello!!!')</script>");
        });

        expect(result.current.userInput).toBe("script>alert('Hello!!!')script>");
        expect(blackListSpy).toBeCalled();
    });
});