import log from "loglevel";

import { Token } from "./definitions";
import { generateSecurityHeaders } from "./utils/generateSecurityHeaders";
import { buildRegionalHost } from "./utils/regionUtil";

export const LOCALSTORAGE_SESSION_ITEM_ID = "TWILIO_WEBCHAT_WIDGET";

let _region = "";
let _deploymentKey = "";

type SessionDataStorage = Token & {
    loginTimestamp: number | null;
};

export async function contactBackend<T>(endpointRoute: string, body: Record<string, unknown> = {}): Promise<T> {
    const _endpoint = `https://flex-api${buildRegionalHost(_region)}.twilio.com/v2`;
    const securityHeaders = await generateSecurityHeaders();
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
        throw new Error("Request to backend failed");
    }

    return response.json();
}

function storeSessionData(data: SessionDataStorage) {
    localStorage.setItem(LOCALSTORAGE_SESSION_ITEM_ID, JSON.stringify(data));
}

function getStoredSessionData() {
    const item = localStorage.getItem(LOCALSTORAGE_SESSION_ITEM_ID);
    let storedData: Token;

    if (!item) {
        return null;
    }

    try {
        storedData = JSON.parse(item);
    } catch (e) {
        log.log("Couldn't parse locally stored data");
        return null;
    }

    return storedData as SessionDataStorage;
}

export const sessionDataHandler = {
    setRegion(region: string = "") {
        _region = region;
    },

    getRegion(): string {
        return _region;
    },

    setDeploymentKey(key: string) {
        _deploymentKey = key;
    },

    getDeploymentKey(): string {
        return _deploymentKey;
    },

    tryResumeExistingSession(): Token | null {
        log.debug("sessionDataHandler: trying to refresh existing session");
        const storedTokenData = getStoredSessionData();

        if (!storedTokenData) {
            log.debug("sessionDataHandler: no tokens stored, no session to refresh");
            return null;
        }

        if (Date.now() >= new Date(storedTokenData.expiration).getTime()) {
            log.debug("sessionDataHandler: token expired, ignoring existing sessions");
            return null;
        }

        log.debug("sessionDataHandler: existing token still valid, using existing session data");

        storeSessionData({
            ...storedTokenData,
            loginTimestamp: storedTokenData.loginTimestamp || null
        });
        return storedTokenData;
    },

    async getUpdatedToken(): Promise<Token> {
        log.debug("sessionDataHandler: trying to get updated token from BE");
        const storedTokenData = getStoredSessionData();

        if (!storedTokenData) {
            throw Error("Can't update token: current token doesn't exist");
        }

        let newTokenData: Token;

        try {
            newTokenData = await contactBackend<Token>("/Webchat/Tokens/Refresh", {
                deployment_key: _deploymentKey,
                token: storedTokenData.token
            });
        } catch (e) {
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
        log.debug("sessionDataHandler: trying to create new session");
        const loginTimestamp = Date.now();

        let newTokenData;

        try {
            newTokenData = await contactBackend<Token>("/Webchat/Init", {
                deployment_key: _deploymentKey,
                customerFriendlyName: formData?.friendlyName || "Customer",
                preEngagementData: JSON.stringify(formData)
            });
        } catch (e) {
            throw Error("No results from server");
        }

        log.debug("sessionDataHandler: new session successfully created");
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
