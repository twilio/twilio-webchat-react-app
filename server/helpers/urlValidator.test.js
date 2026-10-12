const { validateMediaUrl } = require("./urlValidator");

const serviceSid = `IS${"a".repeat(32)}`;
const otherServiceSid = `IS${"b".repeat(32)}`;
const mediaSid = `ME${"c".repeat(32)}`;
const mcsMediaUrl = `https://mcs.us1.twilio.com/v1/Services/${serviceSid}/Media/${mediaSid}`;
const mediaHostUrl = `https://media.us1.twilio.com/${mediaSid}`;
const NOT_TWILIO_MEDIA_URL = "URL is not a Twilio media URL";

describe("validateMediaUrl", () => {
    const originalServiceSid = process.env.CONVERSATIONS_SERVICE_SID;

    beforeEach(() => {
        process.env.CONVERSATIONS_SERVICE_SID = serviceSid;
    });

    afterAll(() => {
        process.env.CONVERSATIONS_SERVICE_SID = originalServiceSid;
    });

    it.each([
        ["an MCS media URL", mcsMediaUrl],
        ["an MCS media content URL", `${mcsMediaUrl}/Content`],
        ["a signed MCS media URL", `${mcsMediaUrl}/Content?Expires=1&Signature=abc&Key-Pair-Id=xyz`],
        ["a media host URL", mediaHostUrl],
        ["a signed media host URL", `${mediaHostUrl}?Expires=1&Signature=abc&Key-Pair-Id=xyz`],
        ["a media host URL with extra path", `${mediaHostUrl}/photo.png`]
    ])("allows %s", async (_description, url) => {
        await expect(validateMediaUrl(url)).resolves.toBe(new URL(url).href);
    });

    it("rejects an unparsable URL", async () => {
        await expect(validateMediaUrl("not a url")).rejects.toThrow("Invalid URL format");
    });

    it("rejects a non-HTTPS URL", async () => {
        await expect(validateMediaUrl(mcsMediaUrl.replace("https:", "http:"))).rejects.toThrow(
            "Only HTTPS URLs allowed"
        );
    });

    it.each([
        ["IPv4-mapped IPv6 loopback", `https://[::ffff:127.0.0.1]/${mediaSid}`],
        ["IPv6 unspecified address", `https://[::]/${mediaSid}`],
        ["IPv6 loopback", `https://[::1]/${mediaSid}`],
        ["IPv6 unique local", `https://[fd00::1]/${mediaSid}`],
        ["localhost", `https://localhost/${mediaSid}`],
        ["IPv4 loopback", `https://127.0.0.1/${mediaSid}`],
        ["decimal IPv4", `https://2130706433/${mediaSid}`],
        ["cloud metadata address", "https://169.254.169.254/latest/meta-data"],
        ["public host", `https://example.com/${mediaSid}`],
        ["lookalike suffix host", `https://media.us1.twilio.com.evil.com/${mediaSid}`],
        ["lookalike prefix host", `https://evilmedia.us1.twilio.com/${mediaSid}`],
        ["other Twilio host", `https://api.twilio.com/${mediaSid}`],
        ["other region", `https://media.ie1.twilio.com/${mediaSid}`]
    ])("rejects %s", async (_description, url) => {
        await expect(validateMediaUrl(url)).rejects.toThrow(NOT_TWILIO_MEDIA_URL);
    });

    it.each([
        ["credentials", `https://user:pass@media.us1.twilio.com/${mediaSid}`],
        ["username only", `https://user@media.us1.twilio.com/${mediaSid}`],
        ["explicit port", `https://media.us1.twilio.com:8443/${mediaSid}`],
        ["another service SID", `https://mcs.us1.twilio.com/v1/Services/${otherServiceSid}/Media/${mediaSid}`],
        ["MCS URL without media SID", `https://mcs.us1.twilio.com/v1/Services/${serviceSid}/Media`],
        ["MCS URL with extra path", `${mcsMediaUrl}/Content/extra`],
        ["MCS service listing", "https://mcs.us1.twilio.com/v1/Services"],
        ["media host without SID", "https://media.us1.twilio.com/"],
        ["malformed media SID", "https://media.us1.twilio.com/ME123"],
        ["non-hex media SID", `https://media.us1.twilio.com/ME${"z".repeat(32)}`],
        ["non-media SID", `https://media.us1.twilio.com/CH${"c".repeat(32)}`]
    ])("rejects a URL with %s", async (_description, url) => {
        await expect(validateMediaUrl(url)).rejects.toThrow(NOT_TWILIO_MEDIA_URL);
    });

    it("rejects MCS URLs when CONVERSATIONS_SERVICE_SID is not set", async () => {
        delete process.env.CONVERSATIONS_SERVICE_SID;

        await expect(validateMediaUrl(mcsMediaUrl)).rejects.toThrow(NOT_TWILIO_MEDIA_URL);
    });
});
