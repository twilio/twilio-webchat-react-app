import { LOCALSTORAGE_SESSION_ITEM_ID } from "../sessionDataHandler";
import { store } from "../store/store";

const HEADER_SEC_DECODER = "i-twilio-sec-decoders";
const HEADER_SEC_USER_AGENT = "i-twilio-user-agent";
const HEADER_SEC_USERSETTINGS = "i-twilio-sec-usersettings";
const HEADER_SEC_WEBCHAT = "i-twilio-sec-webchatinfo";

type SecurityHeadersType = {
    [HEADER_SEC_USER_AGENT]: string;
    [HEADER_SEC_USERSETTINGS]: string;
    [HEADER_SEC_WEBCHAT]: string;
    [HEADER_SEC_DECODER]: string;
};

type MediaCapabilitiesInfo = MediaCapabilitiesDecodingInfo | MediaCapabilitiesEncodingInfo;

export const DEFAULT_NAVIGATOR_LANG = "en_IN";
export const DEFAULT_COOKIE_ENABLED = false;
export const DEFAULT_LOGIN_TIMESTAMP = "9999999";
const DEFAULT_CODEC_INFO = {
    powerEfficient: false,
    smooth: false,
    supported: false,
    keySystemAccess: "twilio-keySystemAccess"
} as MediaCapabilitiesInfo;

const getUserSpecificSettings = () => {
    return {
        language: navigator.language ?? DEFAULT_NAVIGATOR_LANG,
        cookieEnabled: navigator.cookieEnabled ?? DEFAULT_COOKIE_ENABLED,
        userTimezone: new Date().getTimezoneOffset()
    };
};

const getWebchatInfo = () => {
    const sessionStorage: string = localStorage.getItem(LOCALSTORAGE_SESSION_ITEM_ID) ?? "";
    const reduxState = store.getState();
    const logger = window.Twilio.getLogger("getWebchatInfo");

    let parsedStorage = null;

    try {
        parsedStorage = JSON.parse(sessionStorage);
    } catch (e) {
        logger.error("Couldn't parse locally stored data");
    }

    return {
        loginTimestamp: parsedStorage?.loginTimestamp || DEFAULT_LOGIN_TIMESTAMP,
        deploymentKey: reduxState?.config?.deploymentKey ?? null
    };
};

const getAudioVideoDecoders = async () => {
    const audioDecorder = navigator.mediaCapabilities?.decodingInfo({
        type: "file",
        audio: {
            contentType: "audio/mp3",
            channels: "2",
            bitrate: 132700,
            samplerate: 5200
        }
    });
    const videoDecorder = navigator.mediaCapabilities?.decodingInfo({
        type: "file",
        audio: {
            contentType: "audio/mp4",
            channels: "2",
            bitrate: 132700,
            samplerate: 5200
        }
    });

    return Promise.allSettled([audioDecorder, videoDecorder]).then(
        (results: Array<PromiseSettledResult<MediaCapabilitiesInfo>>) => {
            const allFullfied = results.every((result) => result.status === "fulfilled" && Boolean(result.value));

            let audio: MediaCapabilitiesInfo = DEFAULT_CODEC_INFO;
            let video: MediaCapabilitiesInfo = DEFAULT_CODEC_INFO;

            if (allFullfied) {
                const _res = results as Array<PromiseFulfilledResult<MediaCapabilitiesInfo>>;

                audio = _res[0].value;
                video = _res[1].value;
            }

            return {
                audio,
                video
            };
        }
    );
};

// eslint-disable-next-line import/no-unused-modules
export const generateSecurityHeaders = async (): Promise<SecurityHeadersType> => {
    const headers = {} as SecurityHeadersType;
    return getAudioVideoDecoders().then((decoders) => {
        headers[HEADER_SEC_WEBCHAT] = JSON.stringify(getWebchatInfo());
        headers[HEADER_SEC_USERSETTINGS] = JSON.stringify(getUserSpecificSettings());
        headers[HEADER_SEC_DECODER] = JSON.stringify(decoders);
        headers[HEADER_SEC_USER_AGENT] = navigator.userAgent;

        return headers;
    });
};
