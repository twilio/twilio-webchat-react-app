import { parseRegionForConversations } from "./regionUtil";

export {};
describe("parseRegionForConversations(region)", () => {
    it.each([
        {
            regionPassed: "us1",
            regionParsed: ""
        },
        {
            regionPassed: "ie1",
            regionParsed: "ie1"
        },
        {
            regionPassed: "",
            regionParsed: ""
        },
        {
            regionPassed: "prod",
            regionParsed: ""
        },
        {
            regionPassed: "stage-au1",
            regionParsed: "stage-au1"
        },
        {
            regionPassed: "stage-us1",
            regionParsed: "stage"
        },
        {
            regionPassed: "dev-us1",
            regionParsed: "dev"
        },
        {
            regionPassed: "dev-us2",
            regionParsed: "dev-us2"
        }
    ])("builds correct region for various values", ({ regionPassed, regionParsed }) => {
        expect(parseRegionForConversations(regionPassed)).toBe(regionParsed);
    });
});
