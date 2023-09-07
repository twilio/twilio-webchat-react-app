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
