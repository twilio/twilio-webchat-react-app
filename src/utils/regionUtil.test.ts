import { parseRegionForConversations } from "./regionUtil";

export {};
describe("parseRegionForConversations(region)", () => {
    it.each([
        {
            regionPassed: "us1",
            regionParsed: "us1"
        },
        {
            regionPassed: "ie1",
            regionParsed: "ie1"
        },
        {
            regionPassed: "",
            regionParsed: "us1"
        },
        {
            regionPassed: "prod",
            regionParsed: "us1"
        },
        {
            regionPassed: "stage-au1",
            regionParsed: "stage-au1"
        },
        {
            regionPassed: "stage-us1",
            regionParsed: "stage-us1"
        },
        {
            regionPassed: "stage",
            regionParsed: "stage-us1"
        },
        {
            regionPassed: "dev",
            regionParsed: "dev-us1"
        },
        {
            regionPassed: "dev-us1",
            regionParsed: "dev-us1"
        },
        {
            regionPassed: "dev-us2",
            regionParsed: "dev-us2"
        }
    ])("builds correct region for various values", ({ regionPassed, regionParsed }) => {
        expect(parseRegionForConversations(regionPassed)).toBe(regionParsed);
    });
});
