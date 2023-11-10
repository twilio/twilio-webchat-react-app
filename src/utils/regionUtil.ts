export function buildRegionalHost(region?: string | null): string {
    switch (region) {
        case "prod":
        case "us1":
        case "":
        case undefined:
        case null:
            return "";
        case "dev-us1":
            return ".dev";
        case "stage-us1":
            return ".stage";
        default:
            return `.${region}`;
    }
}

export function parseRegionForConversations(region?: string | null): string {
    switch (region) {
        case "prod":
        case "":
        case undefined:
        case null:
            return "us1";
        case "dev":
            return "dev-us1";
        case "stage":
            return "stage-us1";
        default:
            return `${region}`;
    }
}
