import { buildRegionalHost } from "./regionUtil";

describe("buildRegionalHost(region)", () => {
    it("builds correct region for various values", () => {
        expect(buildRegionalHost("us1")).toBe("");
        expect(buildRegionalHost("ie1")).toBe(".ie1");
        expect(buildRegionalHost("")).toBe("");
        expect(buildRegionalHost("prod")).toBe("");
        expect(buildRegionalHost("stage-au1")).toBe(".stage-au1");
        expect(buildRegionalHost("stage-us1")).toBe(".stage");
        expect(buildRegionalHost("dev-us1")).toBe(".dev");
        expect(buildRegionalHost("dev-us2")).toBe(".dev-us2");
    });
});
