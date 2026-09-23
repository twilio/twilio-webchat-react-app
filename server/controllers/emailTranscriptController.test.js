const { sendMessage } = require("../helpers/email");
const { emailTranscriptController } = require("./emailTranscriptController");

jest.mock("../helpers/email", () => ({
    sendMessage: jest.fn()
}));

const validBody = {
    recipientAddress: "customer@example.com",
    subject: "Your chat transcript",
    text: "<p>Transcript</p>",
    mediaInfo: [],
    uniqueFilenames: []
};

const buildRes = () => ({
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
});

describe("emailTranscriptController", () => {
    beforeEach(() => {
        sendMessage.mockReset();
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it("sends the email and responds with the result when all fields are valid", async () => {
        sendMessage.mockResolvedValue({ message: "Transcript email sent to: customer@example.com" });
        const res = buildRes();

        await emailTranscriptController({ body: validBody }, res);

        expect(sendMessage).toHaveBeenCalledWith(validBody);
        expect(res.json).toHaveBeenCalledWith({ message: "Transcript email sent to: customer@example.com" });
        expect(res.status).not.toHaveBeenCalled();
    });

    it.each([
        ["missing recipientAddress", { ...validBody, recipientAddress: undefined }, "Invalid recipientAddress"],
        ["non-string recipientAddress", { ...validBody, recipientAddress: 12345 }, "Invalid recipientAddress"],
        ["badly formatted email", { ...validBody, recipientAddress: "not-an-email" }, "Invalid email format"],
        ["missing subject", { ...validBody, subject: undefined }, "Invalid subject"],
        ["non-string subject", { ...validBody, subject: 123 }, "Invalid subject"],
        ["non-string text", { ...validBody, text: 123 }, "Invalid text"],
        ["mediaInfo not an array", { ...validBody, mediaInfo: "not-an-array" }, "mediaInfo must be an array"],
        [
            "uniqueFilenames not an array",
            { ...validBody, uniqueFilenames: "not-an-array" },
            "uniqueFilenames must be an array"
        ]
    ])("rejects with 400 when %s", async (_description, body, expectedError) => {
        const res = buildRes();

        await emailTranscriptController({ body }, res);

        expect(sendMessage).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: expectedError });
    });

    it("allows a missing text field (it's optional)", async () => {
        sendMessage.mockResolvedValue({ message: "sent" });
        const res = buildRes();
        const body = { ...validBody, text: undefined };

        await emailTranscriptController({ body }, res);

        expect(sendMessage).toHaveBeenCalledWith(body);
        expect(res.status).not.toHaveBeenCalled();
    });
});
