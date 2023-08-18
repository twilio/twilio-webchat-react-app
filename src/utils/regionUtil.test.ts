import { buildRegionalHost } from "./regionUtil";

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
