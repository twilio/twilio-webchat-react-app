import { generateSecurityHeaders } from "./generateSecurityHeaders";

navigator = {
    userAgent: "",
    language: "",
    cookieEnabled: true,
    mediaCapabilities: {
        encodingInfo: jest.fn().mockResolvedValue({} as unknown as MediaCapabilitiesEncodingInfo),
        decodingInfo: jest.fn().mockResolvedValue({} as unknown as MediaCapabilitiesDecodingInfo)
    }
} as Partial<Navigator> as Navigator;

describe("Generate Security Headers", () => {
    it("Should generateSecurityHeaders", async () => {
        jest.useFakeTimers().setSystemTime(new Date("2023-01-01"));
        // eslint-disable-next-line no-proto
        jest.spyOn(localStorage.__proto__, "getItem").mockReturnValue(
            JSON.stringify({
                token: "token",
                loginTimestamp: "TODAY"
            })
        );
        Object.defineProperty(navigator, "mediaCapabilities", {
            writable: true,
            value: {
                decodingInfo: jest
                    .fn()
                    .mockResolvedValue({ decodingInfo: true } as unknown as MediaCapabilitiesDecodingInfo)
            }
        });
        Object.defineProperty(navigator, "userAgent", {
            writable: true,
            value: "USER_AGENT"
        });
        Object.defineProperty(navigator, "cookieEnabled", {
            writable: true,
            value: false
        });
        Object.defineProperty(navigator, "plugins", {
            writable: true,
            value: {
                0: { name: "Plugin A" },
                1: { name: "Plugin B" }
            }
        });
        Object.defineProperty(navigator, "language", {
            writable: true,
            value: "en_IN"
        });

        const headers = await generateSecurityHeaders();

        expect(headers).not.toBeFalsy();
        expect(headers["X-Sec-Browseros"]).toEqual("USER_AGENT");
        expect(JSON.parse(headers["X-Sec-Usersettings"])).toMatchObject({
            plugins: ["Plugin A", "Plugin B"],
            language: "en_IN",
            cookieEnabled: false,
            userTimezone: new Date().getTimezoneOffset()
        });
        expect(JSON.parse(headers["X-Sec-Decoders"])).toMatchObject({
            audio: { decodingInfo: true },
            video: { decodingInfo: true }
        });
        expect(JSON.parse(headers["X-Sec-Webchatinfo"])).toMatchObject({});
    });

    // eslint-disable-next-line sonarjs/no-identical-functions
    it("generateSecurityHeaders should work with default values", async () => {
        jest.useFakeTimers().setSystemTime(new Date("2023-01-01"));
        // eslint-disable-next-line no-proto
        jest.spyOn(localStorage.__proto__, "getItem").mockReturnValue(
            JSON.stringify({
                token: "token",
                loginTimestamp: null
            })
        );
        Object.defineProperty(navigator, "mediaCapabilities", {
            writable: true,
            value: {
                decodingInfo: jest.fn().mockRejectedValue(null)
            }
        });
        Object.defineProperty(navigator, "userAgent", {
            writable: true,
            value: "USER_AGENT_2"
        });
        Object.defineProperty(navigator, "cookieEnabled", {
            writable: true,
            value: false
        });
        Object.defineProperty(navigator, "plugins", {
            writable: true,
            value: {}
        });
        Object.defineProperty(navigator, "language", {
            writable: true,
            value: null
        });

        const headers = await generateSecurityHeaders();

        expect(headers).not.toBeFalsy();
        expect(headers["X-Sec-Browseros"]).toEqual("USER_AGENT_2");
        expect(JSON.parse(headers["X-Sec-Usersettings"])).toMatchObject({
            plugins: [],
            language: "en_IN",
            cookieEnabled: false,
            userTimezone: new Date().getTimezoneOffset()
        });
        expect(JSON.parse(headers["X-Sec-Decoders"])).toMatchObject({
            audio: null,
            video: null
        });
        expect(JSON.parse(headers["X-Sec-Webchatinfo"])).toMatchObject({});
    });
});
