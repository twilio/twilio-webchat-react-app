import log from "loglevel";

import { LOCALSTORAGE_SESSION_ITEM_ID } from "../sessionDataHandler";
import { store } from "../store/store";

type SecurityHeaders = {
    "X-Sec-Browseros": string;
    "X-Sec-Usersettings": string;
    "X-Sec-Webchatinfo": string;
    "X-Sec-Decoders": string;
};

const getUserSpecificSettings = () => {
    return {
        language: navigator.language ?? "en_IN",
        cookieEnabled: navigator.cookieEnabled ?? false,
        userTimezone: new Date().getTimezoneOffset() ?? "GMT"
    };
};

const getWebchatInfo = () => {
    const sessionStorage = localStorage.getItem(LOCALSTORAGE_SESSION_ITEM_ID) as string;
    const reduxState = store.getState();

    let parsedStorage = null;

    try {
        parsedStorage = JSON.parse(sessionStorage);
    } catch (e) {
        log.log("Couldn't parse locally stored data");
    }

    return {
        loginTimestamp: parsedStorage?.loginTimestamp || null,
        deploymentKey: reduxState.config.deploymentKey
    };
};

const getAudioVideoDecoders = async () => {
    const audioDecorder = navigator.mediaCapabilities.decodingInfo({
        type: "file",
        audio: {
            contentType: "audio/mp3",
            channels: "2",
            bitrate: 132700,
            samplerate: 5200
        }
    });
    const videoDecorder = navigator.mediaCapabilities.decodingInfo({
        type: "file",
        audio: {
            contentType: "audio/mp4",
            channels: "2",
            bitrate: 132700,

            samplerate: 5200
        }
    });
    return Promise.allSettled([audioDecorder, videoDecorder]).then((results: Array<PromiseSettledResult<unknown>>) => {
        const allFullfied = results.every((result) => result.status === "fulfilled");

        if (!allFullfied) {
            return {
                audio: null,
                video: null
            };
        }
        return {
            audio: (results[0] as PromiseFulfilledResult<unknown>).value,
            video: (results[1] as PromiseFulfilledResult<unknown>).value
        };
    });
};

// eslint-disable-next-line import/no-unused-modules
export const generateSecurityHeaders = async (): Promise<SecurityHeaders> => {
    const headers = {} as SecurityHeaders;
    return getAudioVideoDecoders().then((decoders) => {
        headers["X-Sec-Webchatinfo"] = JSON.stringify(getWebchatInfo());
        headers["X-Sec-Usersettings"] = JSON.stringify(getUserSpecificSettings());
        headers["X-Sec-Decoders"] = JSON.stringify(decoders);
        headers["X-Sec-Browseros"] = navigator.userAgent;

        return headers;
    });
};
