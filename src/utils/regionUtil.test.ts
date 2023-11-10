import { buildRegionalHost, parseRegionForConversations } from "./regionUtil";

export {};
describe("Build Regions", () => {
    describe("buildRegionalHost(region)", () => {
        it.each([
            {
                regionPassed: "us1",
                regionExpected: ""
            },
            {
                regionPassed: "ie1",
                regionExpected: ".ie1"
            },
            {
                regionPassed: "",
                regionExpected: ""
            },
            {
                regionPassed: null,
                regionExpected: ""
            },
            {
                regionPassed: undefined,
                regionExpected: ""
            },
            {
                regionPassed: "prod",
                regionExpected: ""
            },
            {
                regionPassed: "stage-au1",
                regionExpected: ".stage-au1"
            },
            {
                regionPassed: "stage-us1",
                regionExpected: ".stage"
            },
            {
                regionPassed: "dev-us1",
                regionExpected: ".dev"
            },
            {
                regionPassed: "dev-us2",
                regionExpected: ".dev-us2"
            }
        ])("builds correct region for various values", ({ regionPassed, regionExpected }) => {
            expect(buildRegionalHost(regionPassed)).toBe(regionExpected);
        });
    });

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
                regionPassed: null,
                regionParsed: "us1"
            },
            {
                regionPassed: undefined,
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
});
