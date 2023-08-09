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
