// Imports global types
import "@twilio-labs/serverless-runtime-types";
import jwt from "jsonwebtoken";
// Fetches specific types
import { Context, ServerlessCallback, ServerlessFunctionSignature } from "@twilio-labs/serverless-runtime-types/types";

type RefreshTokenEvent = {
    token?: string;
};

// If you want to use environment variables, you will need to type them like
// this and add them to the Context in the function signature
type FunctionContext = {
    ADDRESS_SID?: string;
    ACCOUNT_SID?: string;
    AUTH_TOKEN?: string;
    API_KEY?: string;
    API_SECRET?: string;
    CONVERSATIONS_SERVICE_SID?: string;
};

const TOKEN_TTL_IN_SECONDS = 60 * 60 * 6;

const createToken = (identity: string, context: Context<FunctionContext>) => {
    console.log("Creating new token");
    const { AccessToken } = Twilio.jwt;
    const { ChatGrant } = AccessToken;

    const chatGrant = new ChatGrant({
        serviceSid: context.CONVERSATIONS_SERVICE_SID
    });

    const token = new AccessToken(context.ACCOUNT_SID ?? "", context.API_KEY ?? "", context.API_SECRET ?? "", {
        identity,
        ttl: TOKEN_TTL_IN_SECONDS
    });
    token.addGrant(chatGrant);
    const jwt = token.toJwt();
    console.log("New token created");
    return jwt;
};

export const handler: ServerlessFunctionSignature = async function (
    context: Context<FunctionContext>,
    event: RefreshTokenEvent,
    callback: ServerlessCallback
) {
    const response = new Twilio.Response();

    response.appendHeader("Access-Control-Allow-Origin", "*");
    response.appendHeader("Access-Control-Allow-Methods", "OPTIONS POST GET");
    response.appendHeader("Content-Type", "application/json");
    response.appendHeader("Access-Control-Allow-Headers", "Content-Type");

    console.log("Refreshing token");
    let providedIdentity;

    try {
        const validatedToken: any = await new Promise((res, rej) =>
            jwt.verify(event.token ?? "", context.API_SECRET ?? "", {}, (err, decoded) => {
                if (err) return rej(err);
                return res(decoded);
            })
        );
        providedIdentity = validatedToken?.grants?.identity;
    } catch (error: any) {
        console.log("Invalid token provided:", error.message);
        response.setStatusCode(403);
        response.setBody({ error: `Invalid token provided: ${error.message}` });
        return callback(null, response);
    }

    console.log("Token is valid for", providedIdentity);

    const refreshedToken = createToken(providedIdentity, context);

    response.setStatusCode(200);
    response.setBody({
        token: refreshedToken,
        expiration: Date.now() + TOKEN_TTL_IN_SECONDS * 1000
    });

    callback(null, response);
};
