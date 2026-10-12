const { URL } = require("url");

const MCS_HOST = "mcs.us1.twilio.com";
const MEDIA_HOST = "media.us1.twilio.com";
const MEDIA_SID = "ME[0-9a-fA-F]{32}";
const MEDIA_HOST_PATH_PATTERN = new RegExp(`^/${MEDIA_SID}(/.*)?$`);
const SERVICE_SID_PATTERN = /^IS[0-9a-fA-F]{32}$/;

const isMcsMediaPath = (pathname) => {
    const serviceSid = process.env.CONVERSATIONS_SERVICE_SID;
    if (!serviceSid || !SERVICE_SID_PATTERN.test(serviceSid)) {
        return false;
    }
    return new RegExp(`^/v1/Services/${serviceSid}/Media/${MEDIA_SID}(/Content)?$`).test(pathname);
};

const isTwilioMediaUrl = (parsedUrl) => {
    if (parsedUrl.username || parsedUrl.password || parsedUrl.port) {
        return false;
    }
    if (parsedUrl.hostname === MCS_HOST) {
        return isMcsMediaPath(parsedUrl.pathname);
    }
    if (parsedUrl.hostname === MEDIA_HOST) {
        return MEDIA_HOST_PATH_PATTERN.test(parsedUrl.pathname);
    }
    return false;
};

const validateMediaUrl = async (urlString) => {
    let parsedUrl;
    try {
        parsedUrl = new URL(urlString);
    } catch {
        throw new Error("Invalid URL format");
    }

    if (parsedUrl.protocol !== "https:") {
        throw new Error("Only HTTPS URLs allowed");
    }

    if (!isTwilioMediaUrl(parsedUrl)) {
        throw new Error("URL is not a Twilio media URL");
    }

    return parsedUrl.href;
};

module.exports = { validateMediaUrl };
