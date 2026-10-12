const axios = require("axios");
const sgMail = require("@sendgrid/mail");

const { getTwilioClient } = require("../helpers/getTwilioClient");
const { emailTranscriptController } = require("./emailTranscriptController");

jest.mock("axios");
jest.mock("@sendgrid/mail", () => ({ setApiKey: jest.fn(), send: jest.fn() }), { virtual: true });
jest.mock("../helpers/getTwilioClient", () => ({ getTwilioClient: jest.fn() }));

const conversationSid = `CH${"a".repeat(32)}`;
const chatServiceSid = `IS${"b".repeat(32)}`;
const mediaSid = `ME${"c".repeat(32)}`;
const temporaryUrl = "https://media.us1.twilio.com/temporary-link";

const INVALID_TYPE = "Invalid type";
const INVALID_CONVERSATION_SID = "Invalid conversationSid";
const INVALID_RECIPIENT_ADDRESS = "Invalid recipientAddress";
const INVALID_SUBJECT = "Invalid subject";

const validBody = {
    type: "transcript",
    conversationSid,
    recipientAddress: "customer@example.com",
    subject: "Your chat transcript"
};

const buildRes = () => ({
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
});

const mockTwilioClient = ({ attributes, conversationError, messages = [] } = {}) => {
    const conversationFetch = conversationError
        ? jest.fn().mockRejectedValue(conversationError)
        : jest.fn().mockResolvedValue({
              chatServiceSid,
              attributes: JSON.stringify(
                  // eslint-disable-next-line camelcase
                  attributes ?? { pre_engagement_data: { email: "Customer@Example.com", name: "John" } }
              )
          });
    const conversationContext = {
        fetch: conversationFetch,
        messages: { list: jest.fn().mockResolvedValue(messages) }
    };
    const usersByIdentity = {
        "customer-identity": { friendlyName: "John" },
        "agent-identity": { friendlyName: "Ben" }
    };
    getTwilioClient.mockReturnValue({
        conversations: {
            conversations: jest.fn().mockReturnValue(conversationContext),
            services: jest.fn().mockReturnValue({
                users: jest.fn((identity) => ({
                    fetch: jest.fn().mockResolvedValue(usersByIdentity[identity] ?? { friendlyName: identity })
                }))
            })
        }
    });
    return conversationContext;
};

describe("emailTranscriptController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.API_KEY = "api-key";
        process.env.API_SECRET = "api-secret";
        process.env.FROM_EMAIL = "noreply@example.com";
        jest.spyOn(console, "error").mockImplementation(() => undefined);
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it.each([
        ["type is missing", { ...validBody, type: undefined }, INVALID_TYPE],
        ["type is not transcript", { ...validBody, type: "other" }, INVALID_TYPE],
        ["conversationSid is missing", { ...validBody, conversationSid: undefined }, INVALID_CONVERSATION_SID],
        ["conversationSid is malformed", { ...validBody, conversationSid: "CH123" }, INVALID_CONVERSATION_SID],
        ["conversationSid is a URL", { ...validBody, conversationSid: "https://[::]/" }, INVALID_CONVERSATION_SID],
        ["recipientAddress is missing", { ...validBody, recipientAddress: undefined }, INVALID_RECIPIENT_ADDRESS],
        [
            "recipientAddress is malformed",
            { ...validBody, recipientAddress: "not-an-email" },
            INVALID_RECIPIENT_ADDRESS
        ],
        ["subject is missing", { ...validBody, subject: undefined }, INVALID_SUBJECT],
        ["subject is not a string", { ...validBody, subject: 123 }, INVALID_SUBJECT]
    ])("rejects with 400 when %s", async (_description, body, expectedError) => {
        const res = buildRes();

        await emailTranscriptController({ body }, res);

        expect(getTwilioClient).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: expectedError });
    });

    it("rejects with 404 when the conversation does not exist", async () => {
        mockTwilioClient({ conversationError: Object.assign(new Error("not found"), { status: 404 }) });
        const res = buildRes();

        await emailTranscriptController({ body: validBody }, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Conversation not found" });
        expect(sgMail.send).not.toHaveBeenCalled();
    });

    it("rejects with 403 when the recipient is not the conversation's pre-engagement email", async () => {
        mockTwilioClient();
        const res = buildRes();

        await emailTranscriptController({ body: { ...validBody, recipientAddress: "attacker@example.com" } }, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: "Recipient is not part of the conversation" });
        expect(sgMail.send).not.toHaveBeenCalled();
    });

    it.each([
        ["no pre-engagement data", {}],
        // eslint-disable-next-line camelcase
        ["no email in pre-engagement data", { pre_engagement_data: { name: "John" } }]
    ])("rejects with 403 when the conversation has %s", async (_description, attributes) => {
        mockTwilioClient({ attributes });
        const res = buildRes();

        await emailTranscriptController({ body: validBody }, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(sgMail.send).not.toHaveBeenCalled();
    });

    it("builds the transcript and attachments server-side and ignores extra input fields", async () => {
        mockTwilioClient({
            messages: [
                {
                    author: "customer-identity",
                    body: "hello",
                    dateCreated: new Date("December 17, 2022 04:30:10"),
                    // eslint-disable-next-line camelcase
                    media: [{ sid: mediaSid, filename: "photo.png", content_type: "image/png" }]
                },
                {
                    author: "agent-identity",
                    body: "hi there",
                    dateCreated: new Date("December 17, 2022 04:31:10"),
                    media: null
                }
            ]
        });
        // eslint-disable-next-line camelcase
        const mediaResource = { links: { content_direct_temporary: temporaryUrl } };
        axios.get.mockImplementation(async (url) =>
            url === temporaryUrl ? { data: Buffer.from("file-bytes") } : { data: mediaResource }
        );
        sgMail.send.mockResolvedValue();
        const res = buildRes();
        const body = {
            ...validBody,
            text: "<script>ignored</script>",
            mediaInfo: [{ url: "https://[::ffff:127.0.0.1]/" }],
            uniqueFilenames: ["ignored.txt"]
        };

        await emailTranscriptController({ body }, res);

        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(axios.get).toHaveBeenCalledWith(
            `https://mcs.us1.twilio.com/v1/Services/${chatServiceSid}/Media/${mediaSid}`,
            expect.objectContaining({ auth: { username: "api-key", password: "api-secret" } })
        );
        expect(axios.get).toHaveBeenCalledWith(temporaryUrl, expect.objectContaining({ responseType: "arraybuffer" }));
        expect(axios.get).not.toHaveBeenCalledWith(expect.stringContaining("127.0.0.1"), expect.anything());

        const sentEmail = sgMail.send.mock.calls[0][0];
        expect(sentEmail.to).toBe("Customer@Example.com");
        expect(sentEmail.from).toBe("noreply@example.com");
        expect(sentEmail.subject).toBe("Your chat transcript");
        expect(sentEmail.html).toContain("Hello John");
        expect(sentEmail.html).toContain("<i>Ben</i>: hi there");
        expect(sentEmail.html).not.toContain("ignored");
        expect(sentEmail.attachments).toEqual([
            {
                content: Buffer.from("file-bytes").toString("base64"),
                filename: "photo.png",
                type: "image/png",
                disposition: "attachment"
            }
        ]);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ message: "Transcript email sent to: Customer@Example.com" });
    });

    it("responds with 500 when sending the email fails", async () => {
        mockTwilioClient({
            messages: [{ author: "customer-identity", body: "hello", dateCreated: new Date(), media: null }]
        });
        sgMail.send.mockRejectedValue(new Error("SendGrid down"));
        const res = buildRes();

        await emailTranscriptController({ body: validBody }, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Failed to send transcript email" });
    });
});
