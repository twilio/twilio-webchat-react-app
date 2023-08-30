import { Token } from "./definitions";
import { generateSecurityHeaders } from "./utils/generateSecurityHeaders";

export const LOCALSTORAGE_SESSION_ITEM_ID = "TWILIO_WEBCHAT_WIDGET";

let _endpoint = "";

type SessionDataStorage = Token & {
    loginTimestamp: number | null;
};

async function contactBackend<T>(endpointRoute: string, body: Record<string, unknown> = {}): Promise<T> {
    const securityHeaders = await generateSecurityHeaders();
    const logger = window.Twilio.getLogger("SessionDataHandler");
    const response = await fetch(_endpoint + endpointRoute, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...securityHeaders
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        logger.error("Request to backend failed");
        throw new Error("Request to backend failed");
    }

    return response.json();
}

function storeSessionData(data: SessionDataStorage) {
    localStorage.setItem(LOCALSTORAGE_SESSION_ITEM_ID, JSON.stringify(data));
}

function getStoredSessionData() {
    const item = localStorage.getItem(LOCALSTORAGE_SESSION_ITEM_ID);
    const logger = window.Twilio.getLogger("SessionDataHandler");
    let storedData: Token;

    if (!item) {
        return null;
    }

    try {
        storedData = JSON.parse(item);
    } catch (e) {
        logger.error("Couldn't parse locally stored data");
        return null;
    }

    return storedData as SessionDataStorage;
}

export const sessionDataHandler = {
    setEndpoint(endpoint: string = "") {
        _endpoint = endpoint;
    },

    getEndpoint() {
        return _endpoint;
    },

    tryResumeExistingSession(): Token | null {
        const logger = window.Twilio.getLogger("SessionDataHandler");
        logger.info("trying to refresh existing session");
        const storedTokenData = getStoredSessionData();

        if (!storedTokenData) {
            logger.warn("no tokens stored, no session to refresh");
            return null;
        }

        if (Date.now() >= new Date(storedTokenData.expiration).getTime()) {
            logger.warn("token expired, ignoring existing sessions");
            return null;
        }

        logger.info("existing token still valid, using existing session data");

        storeSessionData({
            ...storedTokenData,
            loginTimestamp: storedTokenData.loginTimestamp || null
        });
        return storedTokenData;
    },

    async getUpdatedToken(): Promise<Token> {
        const logger = window.Twilio.getLogger("SessionDataHandler");
        logger.info("trying to get updated token from BE");
        const storedTokenData = getStoredSessionData();

        if (!storedTokenData) {
            logger.error("Can't update token: current token doesn't exist");
            throw Error("Can't update token: current token doesn't exist");
        }

        let newTokenData: Token;

        try {
            newTokenData = await contactBackend<Token>("/refreshToken", {
                token: storedTokenData.token
            });
        } catch (e) {
            logger.error(`Something went wrong when trying to get an updated token: ${e}`);
            throw Error(`Something went wrong when trying to get an updated token: ${e}`);
        }

        // Server won't return a conversation SID, so we merge the existing data with the latest one
        const updatedSessionData = {
            ...storedTokenData,
            ...newTokenData
        };

        storeSessionData(updatedSessionData);
        return updatedSessionData;
    },

    fetchAndStoreNewSession: async ({ formData }: { formData: Record<string, unknown> }) => {
        const logger = window.Twilio.getLogger("SessionDataHandler");
        logger.info("trying to create new session");
        const loginTimestamp = Date.now();

        let newTokenData;

        try {
            newTokenData = await contactBackend<Token>("/initWebchat", { formData });
        } catch (e) {
            logger.error("No results from server");
            throw Error("No results from server");
        }

        logger.info("new session successfully created");
        storeSessionData({
            ...newTokenData,
            loginTimestamp
        });

        return newTokenData;
    },

    clear: () => {
        localStorage.removeItem(LOCALSTORAGE_SESSION_ITEM_ID);
    }
};
