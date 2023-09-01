export function parseRegionForEventBridge(region) {
    switch (region) {
        case "prod":
        case "":
        case "us1":
        case undefined:
        case null:
            return "";
        case "stage":
            return ".stage-us1";
        case "dev":
            return ".dev-us1";
        default:
            return `.${region}`;
    }
}

export function parseRegionForTwilioClient(region) {
    switch (region) {
        case "prod":
        case "us1":
            return "";
        case "stage-us1":
            return "stage";
        case "dev-us1":
            return "dev";
        default:
            return region;
    }
}
