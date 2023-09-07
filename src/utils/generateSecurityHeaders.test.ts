import {
    generateSecurityHeaders,
    DEFAULT_COOKIE_ENABLED,
    DEFAULT_LOGIN_TIMESTAMP,
    DEFAULT_NAVIGATOR_LANG
} from "./generateSecurityHeaders";
import WebChatLogger from "../logger";

jest.mock("../logger");

const HEADER_SEC_DECODER = "i-twilio-sec-decoders";
const HEADER_SEC_USERAGENT = "i-twilio-user-agent";
const HEADER_SEC_USERSETTINGS = "i-twilio-sec-usersettings";
const HEADER_SEC_WEBCHAT = "i-twilio-sec-webchatinfo";

describe("Generate Security Headers", () => {
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
            value: true
        });
        Object.defineProperty(navigator, "language", {
            writable: true,
            value: "en_US"
        });

        const headers = await generateSecurityHeaders();

        expect(headers).not.toBeFalsy();
        expect(headers[HEADER_SEC_USERAGENT]).toEqual("USER_AGENT");
        expect(JSON.parse(headers[HEADER_SEC_USERSETTINGS])).toMatchObject({
            language: "en_US",
            cookieEnabled: true,
            userTimezone: new Date().getTimezoneOffset()
        });
        expect(JSON.parse(headers[HEADER_SEC_DECODER])).toMatchObject({
            audio: { decodingInfo: true },
            video: { decodingInfo: true }
        });
        expect(JSON.parse(headers[HEADER_SEC_WEBCHAT])).toMatchObject({
            loginTimestamp: "TODAY",
            deploymentKey: null
        });
    });

    // eslint-disable-next-line sonarjs/no-identical-functions
    it("generateSecurityHeaders should work with default values", async () => {
        const sampleDefaultCodecInfo = {
            powerEfficient: false,
            smooth: false,
            supported: false,
            keySystemAccess: "twilio-keySystemAccess"
        };
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
            value: null
        });
        Object.defineProperty(navigator, "language", {
            writable: true,
            value: null
        });

        let headers = await generateSecurityHeaders();

        expect(headers).not.toBeFalsy();
        expect(headers[HEADER_SEC_USERAGENT]).toEqual("USER_AGENT_2");
        expect(JSON.parse(headers[HEADER_SEC_USERSETTINGS])).toMatchObject({
            language: DEFAULT_NAVIGATOR_LANG,
            cookieEnabled: DEFAULT_COOKIE_ENABLED,
            userTimezone: new Date().getTimezoneOffset()
        });
        expect(JSON.parse(headers[HEADER_SEC_DECODER])).toMatchObject({
            audio: sampleDefaultCodecInfo,
            video: sampleDefaultCodecInfo
        });
        expect(JSON.parse(headers[HEADER_SEC_WEBCHAT])).toMatchObject({
            loginTimestamp: DEFAULT_LOGIN_TIMESTAMP,
            deploymentKey: null
        });

        Object.defineProperty(navigator, "mediaCapabilities", {
            writable: true,
            value: null
        });

        headers = await generateSecurityHeaders();

        expect(JSON.parse(headers[HEADER_SEC_DECODER])).toMatchObject({
            audio: sampleDefaultCodecInfo,
            video: sampleDefaultCodecInfo
        });
    });
});
