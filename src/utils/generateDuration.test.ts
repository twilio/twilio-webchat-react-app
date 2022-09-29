import { generateDuration } from "./generateDuration";
import { Transcript } from "../components/ConversationEnded"

describe("File Preview", () => {
    it("when supplied transcript data, calculate the duration of the chat", () => {
        const transcriptData: Transcript[] = [
            { author: "John", body: "hi", timeStamp: new Date("December 17, 2022 04:30:10"), attachedMedia: null },
            { author: "John", body: "hi", timeStamp: new Date("December 20, 2022 03:24:00"), attachedMedia: null }
        ];
        expect(generateDuration(transcriptData)).toEqual("2 days 22 hours 53 minutes 50 seconds ");
    });
});
