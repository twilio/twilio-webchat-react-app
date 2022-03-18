import fetchMock from "fetch-mock-jest";

import { sessionDataHandler } from "../sessionDataHandler";

describe("session data handler", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should set an endpoint", () => {
        sessionDataHandler.setEndpoint("foo");
        expect(sessionDataHandler.getEndpoint()).toBe("foo");
    });

    describe("fetch and store new session", () => {
        it("should throw if backend request fails", async () => {
            jest.spyOn(window, "fetch").mockImplementationOnce(() => {
                throw Error("Backend failed to process the request");
            });

            await expect(sessionDataHandler.fetchAndStoreNewSession({ formData: {} })).rejects.toThrowError();
        });

        it("should store new token data in local storage", async () => {
            const setLocalStorageItemSpy = jest.spyOn(Object.getPrototypeOf(window.localStorage), "setItem");

            const tokenPayload = {
                expiration: Date.now() + 10e5,
                token: "new token",
                conversationSid: "sid"
            };
            fetchMock.once(() => true, tokenPayload);
            await sessionDataHandler.fetchAndStoreNewSession({ formData: {} });

            expect(setLocalStorageItemSpy).toHaveBeenCalledWith("TWILIO_WEBCHAT_WIDGET", JSON.stringify(tokenPayload));
        });

        it("should return a new token", async () => {
            const tokenPayload = {
                expiration: Date.now() + 10e5,
                token: "new token",
                conversationSid: "sid"
            };
            fetchMock.once(() => true, tokenPayload);
            const { token } = await sessionDataHandler.fetchAndStoreNewSession({ formData: {} });

            expect(token).toBe(tokenPayload.token);
        });
    });

    describe("resuming existing session", () => {
        it("should succeed trying to resume an existing session if the token is valid", () => {
            jest.spyOn(Object.getPrototypeOf(window.localStorage), "getItem").mockReturnValueOnce(
                JSON.stringify({
                    expiration: Date.now() + 10e5,
                    token: "token",
                    conversationSid: "sid"
                })
            );

            const tokenPayload = sessionDataHandler.tryResumeExistingSession();

            expect(tokenPayload).not.toBeNull();
        });

        it("should fail trying to resume an existing session if the token has expired", () => {
            jest.spyOn(Object.getPrototypeOf(window.localStorage), "getItem").mockReturnValueOnce(
                JSON.stringify({
                    expiration: Date.now() - 10e5,
                    token: "token",
                    conversationSid: "sid"
                })
            );

            const tokenPayload = sessionDataHandler.tryResumeExistingSession();

            expect(tokenPayload).toBeNull();
        });

        it("should fail trying to resume an existing session if the localStorage is empty", () => {
            jest.spyOn(Object.getPrototypeOf(window.localStorage), "getItem").mockReturnValueOnce(null);

            const tokenPayload = sessionDataHandler.tryResumeExistingSession();

            expect(tokenPayload).toBeNull();
        });

        it("should fail trying to resume an existing session if the localStorage has badly formatted data", () => {
            jest.spyOn(Object.getPrototypeOf(window.localStorage), "getItem").mockReturnValueOnce({
                expiration: Date.now() + 10e5,
                token: "token",
                conversationSid: "sid"
            });

            const tokenPayload = sessionDataHandler.tryResumeExistingSession();

            expect(tokenPayload).toBeNull();
        });
    });

    describe("updating the token", () => {
        it("should throw if current token doesn't exist", async () => {
            jest.spyOn(Object.getPrototypeOf(window.localStorage), "getItem").mockReturnValueOnce(null);

            await expect(sessionDataHandler.getUpdatedToken()).rejects.toThrowError();
        });

        it("should throw if backend request fails", async () => {
            jest.spyOn(Object.getPrototypeOf(window.localStorage), "getItem").mockReturnValueOnce(
                JSON.stringify({
                    expiration: Date.now() - 10e5,
                    token: "token",
                    conversationSid: "sid"
                })
            );
            jest.spyOn(window, "fetch").mockImplementationOnce(() => {
                throw Error("Backend failed to process the request");
            });

            await expect(sessionDataHandler.getUpdatedToken()).rejects.toThrowError();
        });

        it("should store new token in local storage", async () => {
            jest.spyOn(Object.getPrototypeOf(window.localStorage), "getItem").mockReturnValueOnce(
                JSON.stringify({
                    expiration: Date.now() + 10e5,
                    token: "token",
                    conversationSid: "sid"
                })
            );
            const setLocalStorageItemSpy = jest.spyOn(Object.getPrototypeOf(window.localStorage), "setItem");

            const tokenPayload = {
                expiration: Date.now() + 10e5,
                token: "new token",
                conversationSid: "sid"
            };
            fetchMock.once(() => true, tokenPayload);
            await sessionDataHandler.getUpdatedToken();

            expect(setLocalStorageItemSpy).toHaveBeenCalledWith("TWILIO_WEBCHAT_WIDGET", JSON.stringify(tokenPayload));
        });

        it("should return a new token", async () => {
            jest.spyOn(Object.getPrototypeOf(window.localStorage), "getItem").mockReturnValueOnce(
                JSON.stringify({
                    expiration: Date.now() + 10e5,
                    token: "token",
                    conversationSid: "sid"
                })
            );

            const tokenPayload = {
                expiration: Date.now() + 10e5,
                token: "new token",
                conversationSid: "sid"
            };
            fetchMock.once(() => true, tokenPayload);
            const { token } = await sessionDataHandler.getUpdatedToken();

            expect(token).toBe(tokenPayload.token);
        });
    });

    it("should clear the token from the local storage", () => {
        const spy = jest.spyOn(Object.getPrototypeOf(window.localStorage), "removeItem");
        sessionDataHandler.clear();
        expect(spy).toHaveBeenCalled();
    });
});
