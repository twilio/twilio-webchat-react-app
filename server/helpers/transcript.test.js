const { getUniqueFilenames, getAgentNames, generateEmailTranscript, generateEmailContent } = require("./transcript");

const customerName = "John";
const agentNames = ["Ben", "Samantha"];

const transcriptData = [
    { author: "John", body: "hi", timeStamp: new Date("December 17, 2022 04:30:10"), media: [] },
    { author: "Concierge", body: "hi", timeStamp: new Date("December 18, 2022 04:30:10"), media: [] },
    { author: "Ben", body: "hi", timeStamp: new Date("December 20, 2022 03:24:00"), media: [] },
    { author: "Samantha", body: "hi", timeStamp: new Date("December 21, 2022 03:24:00"), media: [] }
];

const transcriptMediaData = [
    { ...transcriptData[0], media: [{ filename: "test.txt" }] },
    { ...transcriptData[1], media: [{ filename: "test.txt" }] },
    { ...transcriptData[2], media: [{ filename: "blah.jpg" }, { filename: "foo.png" }, { filename: "booo.png" }] },
    { ...transcriptData[3], media: [{ filename: "blah.png" }, { filename: "blah.png" }] }
];

describe("getUniqueFilenames", () => {
    it("suffixes repeated filenames in order", () => {
        expect(getUniqueFilenames(transcriptMediaData)).toEqual([
            "test.txt",
            "test-1.txt",
            "blah.jpg",
            "foo.png",
            "booo.png",
            "blah.png",
            "blah-1.png"
        ]);
    });
});

describe("getAgentNames", () => {
    it("excludes the customer and Concierge", () => {
        expect(getAgentNames(customerName, transcriptData)).toEqual(agentNames);
    });
});

describe("generateEmailTranscript", () => {
    it("generates the transcript", () => {
        expect(generateEmailTranscript(customerName, agentNames, transcriptData)).toEqual(
            `Chat with <strong>${customerName}</strong> and <strong>${agentNames[0]}</strong> and <strong>${agentNames[1]}</strong><br><br><strong>Date:</strong> 17 December 2022<br><strong>Duration:</strong> 3 days 22 hours 53 minutes 50 seconds <br><br>04:30 <i>${customerName}</i>: hi<br><br>04:30 <i>Concierge</i>: hi<br><br>03:24 <i>${agentNames[0]}</i>: hi<br><br>03:24 <i>${agentNames[1]}</i>: hi<br><br>`
        );
    });

    it("generates the transcript with file attachments", () => {
        expect(generateEmailTranscript(customerName, agentNames, transcriptMediaData)).toEqual(
            `Chat with <strong>${customerName}</strong> and <strong>${agentNames[0]}</strong> and <strong>${agentNames[1]}</strong><br><br><strong>Date:</strong> 17 December 2022<br><strong>Duration:</strong> 3 days 22 hours 53 minutes 50 seconds <br><br>04:30 <i>${customerName}</i>: hi (** Attached file <i>test.txt</i> **)<br><br>04:30 <i>Concierge</i>: hi (** Attached file <i>test-1.txt</i> **)<br><br>03:24 <i>${agentNames[0]}</i>: hi (** Attached file <i>blah.jpg</i> **) (** Attached file <i>foo.png</i> **) (** Attached file <i>booo.png</i> **)<br><br>03:24 <i>${agentNames[1]}</i>: hi (** Attached file <i>blah.png</i> **) (** Attached file <i>blah-1.png</i> **)<br><br>`
        );
    });

    it("escapes HTML in message bodies and author names", () => {
        const maliciousData = [
            {
                author: "<b>Eve</b>",
                body: '<img src="x" onerror="alert(1)">',
                timeStamp: transcriptData[0].timeStamp,
                media: []
            }
        ];
        const transcript = generateEmailTranscript("<b>Eve</b>", [], maliciousData);
        expect(transcript).not.toContain("<img");
        expect(transcript).toContain("&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;");
        expect(transcript).toContain("<strong>&lt;b&gt;Eve&lt;/b&gt;</strong>");
    });
});

describe("generateEmailContent", () => {
    it("wraps the transcript in the default template", () => {
        expect(generateEmailContent("John", "TRANSCRIPT")).toEqual(
            `<div><h1 style="text-align:center;">Chat Transcript</h1><p>Hello John,<br><br>Please see below your transcript, with any associated files attached, as requested.<br><br>TRANSCRIPT</p></div>`
        );
    });
});
