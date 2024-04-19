// Imports global types
import "@twilio-labs/serverless-runtime-types";
import axios from "axios";
// Fetches specific types
import { Context, ServerlessCallback, ServerlessFunctionSignature } from "@twilio-labs/serverless-runtime-types/types";

type InitWebchatEvent = {
    formData?: {
        friendlyName: string;
        email: string;
        query: string;
        brand: string;
        posProfile: string;
    };
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

const contactWebchatOrchestrator = async (
    event: InitWebchatEvent,
    customerFriendlyName: string,
    context: Context<FunctionContext>
) => {


    const brand = event.formData?.brand;
    const posProfile = event.formData?.posProfile;

    if (!brand) {
        throw new Error("Brand is required")
    }

    if (!posProfile) {
        throw new Error("POS Profile is required")
    }

    const params = new URLSearchParams();
    params.append("AddressSid", context.ADDRESS_SID ?? "");
    params.append("ChatFriendlyName", "Webchat widget");
    params.append("CustomerFriendlyName", customerFriendlyName);
    params.append(
        "PreEngagementData",
        JSON.stringify({
            ...event.formData,
            friendlyName: customerFriendlyName,
            brand,
            posProfile
        })
    );

    let conversationSid;
    let identity;

    try {
        const res = await axios.post(`https://flex-api.twilio.com/v2/WebChats`, params, {
            auth: {
                username: context.ACCOUNT_SID ?? "",
                password: context.AUTH_TOKEN ?? ""
            }
        });
        ({ identity, conversation_sid: conversationSid } = res.data);
    } catch (error: any) {
        console.log("Something went wrong during the orchestration:", error.response?.data?.message);
        throw error.response.data;
    }

    console.log("Webchat Orchestrator successfully called");

    return {
        conversationSid,
        identity
    };
};

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

const sendUserMessage = async (
    conversationSid: string,
    identity: string,
    messageBody: string,
    context: Context<FunctionContext>
) => {
    console.log("Sending user message");
    const twilioClient = context.getTwilioClient();
    await twilioClient.conversations
        .conversations(conversationSid)
        .messages.create({
            body: messageBody,
            author: identity,
            xTwilioWebhookEnabled: "true" // trigger webhook
        })
        .then(() => {
            console.log("(async) User message sent");
        })
        .catch((e) => {
            console.log(`(async) Couldn't send user message: ${e?.message}`);
        });
};

const sendWelcomeMessage = async (
    conversationSid: string,
    customerFriendlyName: string,
    context: Context<FunctionContext>
) => {
    console.log("Sending welcome message");
    const twilioClient = context.getTwilioClient();
    await twilioClient.conversations
        .conversations(conversationSid)
        .messages.create({
            body: `Welcome ${customerFriendlyName}! An agent will be with you in just a moment.`,
            author: "Concierge"
        })
        .then(() => {
            console.log("(async) Welcome message sent");
        })
        .catch((e) => {
            console.log(`(async) Couldn't send welcome message: ${e?.message}`);
        });
};

export const handler: ServerlessFunctionSignature = async function (
    context: Context<FunctionContext>,
    event: InitWebchatEvent,
    callback: ServerlessCallback
) {
    const response = new Twilio.Response();

    response.appendHeader("Access-Control-Allow-Origin", "*");
    response.appendHeader("Access-Control-Allow-Methods", "OPTIONS POST GET");
    response.appendHeader("Content-Type", "application/json");
    response.appendHeader("Access-Control-Allow-Headers", "Content-Type");

    const customerFriendlyName = event.formData?.friendlyName || "Customer";

    let conversationSid: string;
    let identity: string;

    // Hit Webchat Orchestration endpoint to generate conversation and get customer participant sid
    try {
        const result = await contactWebchatOrchestrator(event, customerFriendlyName, context);
        ({ identity, conversationSid } = result);
    } catch (error: any) {
        response.setStatusCode(500);
        response.setBody(`Couldn't initiate WebChat: ${error?.message}`);
        return callback(null, response);
    }

    // Generate token for customer
    const token = createToken(identity, context);

    // OPTIONAL — if user query is defined
    if (event.formData?.query) {
        // use it to send a message in behalf of the user with the query as body
        await sendUserMessage(conversationSid, identity, event.formData.query, context);
        // and then send another message from Concierge, letting the user know that an agent will help them soon
        await sendWelcomeMessage(conversationSid, customerFriendlyName, context);
    }

    response.setStatusCode(200);
    response.setBody({
        token,
        conversationSid,
        expiration: Date.now() + TOKEN_TTL_IN_SECONDS * 1000
    });

    console.log("Webchat successfully initiated");

    callback(null, response);
};
