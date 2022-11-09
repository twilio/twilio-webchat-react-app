import { generateDuration } from "./generateDuration";
import { Transcript } from "./generateTranscripts";

describe("File Preview", () => {
    it("when supplied transcript data, calculate the duration of the chat", () => {
        const transcriptData: Transcript[] = [
            { author: "John", body: "hi", timeStamp: new Date("December 17, 2022 04:30:10"), attachedMedia: null },
            { author: "John", body: "hi", timeStamp: new Date("December 20, 2022 03:24:00"), attachedMedia: null }
        ];
        expect(generateDuration(transcriptData)).toEqual("2 days 22 hours 53 minutes 50 seconds ");
    });

    it("calculate the duration of the chat lasting 1 minute", () => {
        const transcriptData: Transcript[] = [
            { author: "John", body: "hi", timeStamp: new Date("December 17, 2022 03:30:10"), attachedMedia: null },
            { author: "John", body: "hi", timeStamp: new Date("December 17, 2022 03:31:10"), attachedMedia: null }
        ];
        expect(generateDuration(transcriptData)).toEqual("1 minute ");
    });

    it("calculate the duration of the chat lasting 1 second", () => {
        const transcriptData: Transcript[] = [
            { author: "John", body: "hi", timeStamp: new Date("December 17, 2022 04:30:10"), attachedMedia: null },
            { author: "John", body: "hi", timeStamp: new Date("December 17, 2022 04:30:11"), attachedMedia: null }
        ];
        expect(generateDuration(transcriptData)).toEqual("1 second ");
    });


    it("calculate the duration of the chat lasting 1 minute and 2 seconds", () => {
        const transcriptData: Transcript[] = [
            { author: "John", body: "hi", timeStamp: new Date("December 17, 2022 04:30:10"), attachedMedia: null },
            { author: "John", body: "hi", timeStamp: new Date("December 17, 2022 04:31:12"), attachedMedia: null }
        ];
        expect(generateDuration(transcriptData)).toEqual("1 minute 2 seconds ");
    });

    it("calculate the duration of the chat lasting 1 hour", () => {
        const transcriptData: Transcript[] = [
            { author: "John", body: "hi", timeStamp: new Date("December 17, 2022 04:30:10"), attachedMedia: null },
            { author: "John", body: "hi", timeStamp: new Date("December 17, 2022 05:30:10"), attachedMedia: null }
        ];
        expect(generateDuration(transcriptData)).toEqual("1 hour ");
    });

    it("calculate the duration of the chat lasting 1 day and 1 hour", () => {
        const transcriptData: Transcript[] = [
            { author: "John", body: "hi", timeStamp: new Date("December 17, 2022 04:30:10"), attachedMedia: null },
            { author: "John", body: "hi", timeStamp: new Date("December 18, 2022 05:30:10"), attachedMedia: null }
        ];
        expect(generateDuration(transcriptData)).toEqual("1 day 1 hour ");
    });

    it("calculate the duration of the chat lasting a year and 1 hour", () => {
        const transcriptData: Transcript[] = [
            { author: "John", body: "hi", timeStamp: new Date("December 17, 2022 04:30:10"), attachedMedia: null },
            { author: "John", body: "hi", timeStamp: new Date("December 17, 2023 05:30:10"), attachedMedia: null }
        ];
        expect(generateDuration(transcriptData)).toEqual("365 days 1 hour ");
    });
});
