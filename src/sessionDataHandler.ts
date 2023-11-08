import { ProcesssedTokenResponse as ProcessedTokenResponse, TokenResponse } from "./definitions";
import { PreEngagementData } from "./store/definitions";
import { generateSecurityHeaders } from "./utils/generateSecurityHeaders";
import { buildRegionalHost } from "./utils/regionUtil";

export const LOCALSTORAGE_SESSION_ITEM_ID = "TWILIO_WEBCHAT_WIDGET";
const CUSTOMER_DEFAULT_NAME = "Customer";

type SessionDataStorage = ProcessedTokenResponse & {
    loginTimestamp: number | null;
};

export type InitWebchatAPIPayload = { 
    CustomerFriendlyName: string;
    PreEngagementData: string;
    DeploymentKey: string;
};

export type RefreshTokenAPIPayload = { 
    DeploymentKey: string;
    token: string;
};

export async function contactBackend<T>(endpointRoute: string, 
    body: InitWebchatAPIPayload | RefreshTokenAPIPayload): Promise<T> {
    /* eslint-disable-next-line no-use-before-define, @typescript-eslint/no-use-before-define */
    const _endpoint = `https://flex-api${buildRegionalHost(sessionDataHandler.getRegion())}.twilio.com/v2`;
    const securityHeaders = await generateSecurityHeaders();
    const logger = window.Twilio.getLogger("SessionDataHandler");
    const urlEncodedBody = new URLSearchParams();
    for (const key in body) {
        if (body.hasOwnProperty(key)) {
            urlEncodedBody.append(key, (body as Record<string, string>)[key].toString());
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
    let storedData: SessionDataStorage;

    if (!item) {
        return null;
    }

    try {
        storedData = JSON.parse(item);
    } catch (e) {
        logger.error("Couldn't parse locally stored data");
        return null;
    }

    return storedData;
}

class SessionDataHandler {
    private _region = "";
    private _deploymentKey = "";

    getRegion() {
        return this._region;
    }

    setRegion(region: string = "") {
        this._region = region;
    }
    setDeploymentKey(key: string) {
        this._deploymentKey = key;
    }

    getDeploymentKey(): string {
        return this._deploymentKey;
    }

    tryResumeExistingSession(): ProcessedTokenResponse | null {
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
    }

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
                DeploymentKey: this._deploymentKey,
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
    }

    async fetchAndStoreNewSession({ formData }: { formData: Record<string, unknown> }) {
        const logger = window.Twilio.getLogger("SessionDataHandler");
        logger.info("trying to create new session");
        const loginTimestamp = Date.now();

        let newTokenData;

        try {
            newTokenData = await contactBackend<TokenResponse>("/Webchat/Init", {
                DeploymentKey: this.getDeploymentKey(),
                CustomerFriendlyName: (formData?.friendlyName as string) || CUSTOMER_DEFAULT_NAME,
                PreEngagementData: JSON.stringify(formData)
            });
        } catch (e) {
            logger.error("No results from server");
            throw Error("No results from server");
        }

        logger.info("new session successfully created");
        const response = this.processNewTokenResponse(newTokenData);
        storeSessionData({
            ...response,
            loginTimestamp
        });

        return response as ProcessedTokenResponse;
    }

    processNewTokenResponse(tokenResponse: TokenResponse): ProcessedTokenResponse {
        return {
            token: tokenResponse.token,
            expiration: tokenResponse.expiration,
            identity: tokenResponse.identity,
            conversationSid: tokenResponse.conversation_sid
        };
    }

    clear() {
        localStorage.removeItem(LOCALSTORAGE_SESSION_ITEM_ID);
    }
}

export const sessionDataHandler = new SessionDataHandler();
