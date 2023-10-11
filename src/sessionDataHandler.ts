import { TokenResponse } from "./definitions";
import { generateSecurityHeaders } from "./utils/generateSecurityHeaders";
import { buildRegionalHost } from "./utils/regionUtil";

export const LOCALSTORAGE_SESSION_ITEM_ID = "TWILIO_WEBCHAT_WIDGET";

let _region = "";
let _deploymentKey = "";

type SessionDataStorage = TokenResponse & {
    loginTimestamp: number | null;
};

export async function contactBackend<T>(endpointRoute: string, body: Record<string, unknown> = {}): Promise<T> {
    const _endpoint = `https://flex-api${buildRegionalHost(_region)}.twilio.com/v2`;
    const securityHeaders = await generateSecurityHeaders();
    const logger = window.Twilio.getLogger("SessionDataHandler");
    const urlEncodedBody = new URLSearchParams();
    for (const key in body) {
        if (body.hasOwnProperty(key)) {
            urlEncodedBody.append(key, body[key] as string);
        }
    }
    const response = await fetch(_endpoint + endpointRoute, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            ...securityHeaders
        },
        body: urlEncodedBody.toString()
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
    let storedData: TokenResponse;

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

    tryResumeExistingSession(): TokenResponse | null {
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
            loginTimestamp: storedTokenData.loginTimestamp ?? null
        });
        return { ...storedTokenData };
    },

    async getUpdatedToken(): Promise<TokenResponse> {
        const logger = window.Twilio.getLogger("SessionDataHandler");
        logger.info("trying to get updated token from BE");
        const storedTokenData = getStoredSessionData();

        if (!storedTokenData) {
            logger.error("Can't update token: current token doesn't exist");
            throw Error("Can't update token: current token doesn't exist");
        }

        let newTokenData: TokenResponse;

        try {
            newTokenData = await contactBackend<TokenResponse>("/Webchat/Tokens/Refresh", {
                DeploymentKey: _deploymentKey,
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
        return { ...updatedSessionData };
    },

    fetchAndStoreNewSession: async ({ formData }: { formData: Record<string, unknown> }) => {
        const logger = window.Twilio.getLogger("SessionDataHandler");
        logger.info("trying to create new session");
        const loginTimestamp = Date.now();

        let newTokenData;

        try {
            newTokenData = await contactBackend<TokenResponse>("/Webchat/Init", {
                DeploymentKey: _deploymentKey,
                CustomerFriendlyName: formData?.friendlyName || "Customer",
                PreEngagementData: JSON.stringify(formData)
            });
        } catch (e) {
            logger.error("No results from server");
            throw Error("No results from server");
        }

        logger.info("new session successfully created");
        storeSessionData({
            ...newTokenData,
            loginTimestamp
        });

        return { ...newTokenData } as TokenResponse;
    },

    clear: () => {
        localStorage.removeItem(LOCALSTORAGE_SESSION_ITEM_ID);
    }
};
