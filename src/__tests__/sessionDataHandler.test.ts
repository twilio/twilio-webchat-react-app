import fetchMock from "fetch-mock-jest";

import { sessionDataHandler, contactBackend } from "../sessionDataHandler";
import WebChatLogger from "../logger";

jest.mock("../logger");

Object.defineProperty(navigator, "mediaCapabilities", {
    writable: true,
    value: {
        decodingInfo: jest.fn().mockResolvedValue({} as unknown as MediaCapabilitiesDecodingInfo)
    }
});

describe("session data handler", () => {
    beforeAll(() => {
        Object.defineProperty(window, "Twilio", {
            value: {
                getLogger(className: string) {
                    return new WebChatLogger(className);
                }
            }
        });
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should set the region", () => {
        sessionDataHandler.setRegion("Foo");
        expect(sessionDataHandler.getRegion()).toBe("Foo");
    });

    it("should set the deployment key", () => {
        sessionDataHandler.setDeploymentKey("key1");
        expect(sessionDataHandler.getDeploymentKey()).toBe("key1");
    });

    describe("contactBackend", () => {
        beforeEach(() => () => {
            sessionDataHandler.setRegion("");
        });

        afterEach(() => {
            sessionDataHandler.setRegion("");
            fetchMock.reset();
        });

        it("should call correct stage url", async () => {
            const mockFetch = Promise.resolve({ ok: true, json: async () => Promise.resolve("okay") });
            const fetchSpy = jest
                .spyOn(window, "fetch")
                .mockImplementation(async (): Promise<never> => mockFetch as Promise<never>);
            sessionDataHandler.setRegion("stage");
            await contactBackend("/Webchat/Tokens/Refresh", { formData: {} });
            expect(fetchSpy.mock.calls[0][0]).toEqual("https://flex-api.stage.twilio.com/v2/Webchat/Tokens/Refresh");
        });

        it("should call correct prod url", async () => {
            const mockFetch = Promise.resolve({ ok: true, json: async () => Promise.resolve("okay") });
            const fetchSpy = jest
                .spyOn(window, "fetch")
                .mockImplementation(async (): Promise<never> => mockFetch as Promise<never>);
            await contactBackend("/Webchat/Tokens/Refresh", { formData: {} });
            expect(fetchSpy.mock.calls[0][0]).toEqual("https://flex-api.twilio.com/v2/Webchat/Tokens/Refresh");
        });
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

            jest.useFakeTimers().setSystemTime(new Date("2023-01-01"));

            const currentTime = Date.now().toString();
            const tokenPayload = {
                expiration: `${currentTime + 10e5}`,
                token: "new token",
                // eslint-disable-next-line camelcase
                conversation_sid: "sid",
                identity: "identity"
            };
            fetchMock.once(() => true, tokenPayload);
            await sessionDataHandler.fetchAndStoreNewSession({ formData: {} });

            const expected = {
                ...sessionDataHandler.processNewTokenResponse(tokenPayload),
                loginTimestamp: currentTime
            };
            expect(setLocalStorageItemSpy).toHaveBeenCalledTimes(3);
            expect(setLocalStorageItemSpy).toHaveBeenNthCalledWith(1, "TWILIO_WEBCHAT_WIDGET", JSON.stringify({
                token: "",
                expiration: "",
                identity: "",
                conversationSid: "",
                loginTimestamp: currentTime
            }));
            expect(setLocalStorageItemSpy).toHaveBeenNthCalledWith(2, "customerIdentity", "identity");
            expect(setLocalStorageItemSpy).toHaveBeenNthCalledWith(3, "TWILIO_WEBCHAT_WIDGET", JSON.stringify(expected));
        });

        it("should return a new token", async () => {
            const tokenPayload = {
                expiration: `${Date.now() + 10e5}`,
                token: "new token",
                // eslint-disable-next-line camelcase
                conversation_sid: "sid",
                identity: "identity"
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
            jest.useFakeTimers().setSystemTime(new Date("2023-01-01"));

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
        const spyRemove = jest.spyOn(Object.getPrototypeOf(window.localStorage), "removeItem");
        sessionDataHandler.clear();
        expect(spyRemove).toHaveBeenCalled();
    });

    describe("contactBackend", () => {
        it("should", async () => {
            jest.spyOn(window, "fetch").mockRejectedValueOnce("ForcedFailure");

            await expect(sessionDataHandler.fetchAndStoreNewSession({ formData: {} })).rejects.toThrowError(
                new Error("No results from server")
            );
        });
    });

    describe("processNewTokenResponse", () => {
        it("should process data as expected", () => {
            const tokenResponse = {
                expiration: "2021-01-01",
                token: "token",
                // eslint-disable-next-line camelcase
                conversation_sid: "sid",
                identity: "identity"
            };

            const processedTokenResponse = sessionDataHandler.processNewTokenResponse(tokenResponse);

            expect(processedTokenResponse).toEqual({
                expiration: "2021-01-01",
                token: "token",
                conversationSid: "sid",
                identity: "identity"
            });
        });
    });
});
