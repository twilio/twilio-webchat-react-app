export function buildRegionalHost(region: string = ""): string {
    switch (region) {
        case "prod":
        case "us1":
        case "":
            return "";
        case "dev-us1":
            return ".dev";
        case "stage-us1":
            return ".stage";
        default:
            return `.${region}`;
    }
}

export function parseRegionForConversations(region: string | undefined = "") {
    region = region || "";
    switch (region) {
        case "prod":
        case "":
            return "us1";
        case "dev":
            return "dev-us1";
        case "stage":
            return "stage-us1";
        default:
            return `${region}`;
    }
}
