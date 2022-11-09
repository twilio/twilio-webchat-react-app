/**
 * @file Webchat Init
 * @author Chris Connolly <cconnolly@twilio.com>
 * @version 1.0.0
 */

// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

import axios from "axios";
import { MessageListInstanceCreateOptions } from "twilio/lib/rest/conversations/v1/service/conversation/message";

const TOKEN_TTL_IN_SECONDS = 60 * 60 * 6;

// ***********************************************************
// Environment Vars
// ***********************************************************
export type MyFunctionContext = {
  DEFAULT_STUDIO_FLOW: string;
  ACCOUNT_SID: string;
  AUTH_TOKEN: string;
  API_KEY: string;
  API_SECRET: string;
  ADDRESS_SID: string;
};
// ***********************************************************
// There are additional attributes,
// but these are the only ones we care about for this
// ***********************************************************
export type EventProperties = {
  formData: {
    friendlyName: string;
    email: string;
    query: string;
  };
};

// ***********************************************************
//
// SERVERLESS HANDLER ENTRY POINT
//
// ***********************************************************
export const handler: ServerlessFunctionSignature<
  MyFunctionContext,
  EventProperties
> = async function (
  context: Context<MyFunctionContext>,
  event: EventProperties,
  callback: ServerlessCallback
) {
  console.log("Init Webchat Handler");
  logInitialAction("Initiating webchat");

  const client = context.getTwilioClient();
  const response = new Twilio.Response();

  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "OPTIONS, POST, GET");
  response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
  response.appendHeader("Content-Type", "application/json");

  const customerFriendlyName = event?.formData?.friendlyName || "Customer";

  let conversationSid: string;
  let identity: string;

  // Hit Webchat Orchestration endpoint to generate conversation and get customer participant sid
  try {
    const result = await contactWebchatOrchestrator(
      context,
      event,
      customerFriendlyName
    );

    ({ identity, conversationSid } = result);
  } catch (error) {
    response.setStatusCode(500);
    response.setBody("Couldn't initiate WebChat");
    return callback(response);
  }

  // Generate token for customer
  const token = await createToken(
    context.ACCOUNT_SID,
    context.API_KEY,
    context.API_SECRET,
    identity
  );

  console.log("Conversation SID", conversationSid);

  // OPTIONAL — if user query is defined
  if (event.formData.query) {
    // use it to send a message in behalf of the user with the query as body

    logInterimAction("Have Twilio Client");

    const messageOpts: MessageListInstanceCreateOptions = {
      body: event.formData.query,
      author: identity,
      xTwilioWebhookEnabled: "true",
    };

    logInterimAction("Message List Instance Create Options:", messageOpts);

    try {
      await client.conversations
        .conversations(conversationSid)
        .messages.create(messageOpts);

      console.log("Sent first user message");
    } catch (err) {
      console.log("Error sending first user message", err);
    }
  } else {
    console.log("No formData.query so skipping initial message");
  }

  logFinalAction("Webchat successfully initiated");

  response.setBody({
    token,
    conversationSid,
    expiration: Date.now() + TOKEN_TTL_IN_SECONDS * 1000,
  });

  return callback(null, response);
};

const contactWebchatOrchestrator = async (
  context: MyFunctionContext,
  data: any,
  customerFriendlyName: string
) => {
  logInterimAction("Calling Webchat Orchestrator");

  const params = new URLSearchParams();
  params.append("AddressSid", context.ADDRESS_SID);
  params.append("ChatFriendlyName", "Webchat widget");
  params.append("CustomerFriendlyName", customerFriendlyName);
  params.append(
    "PreEngagementData",
    JSON.stringify({
      ...data.formData,
      friendlyName: customerFriendlyName,
    })
  );

  console.log("Params for chat orchestrator", params);

  let conversationSid;
  let identity;

  try {
    const res = await axios.post(
      `https://flex-api.twilio.com/v2/WebChats`,
      params,
      {
        auth: {
          username: context.ACCOUNT_SID,
          password: context.AUTH_TOKEN,
        },
      }
    );
    ({ identity, conversation_sid: conversationSid } = res.data);
  } catch (e: any) {
    logInterimAction(
      "Something went wrong during the orchestration:",
      e.response?.data?.message
    );
    throw e.response.data;
  }

  logInterimAction("Webchat Orchestrator successfully called");

  return {
    conversationSid,
    identity,
  };
};

const sendWelcomeMessage = (
  context: Context<MyFunctionContext>,
  conversationSid: string,
  customerFriendlyName: string
) => {
  logInterimAction("Sending welcome message");

  const client = context.getTwilioClient();
  return client.conversations
    .conversations(conversationSid)
    .messages.create({
      body: `Welcome ${customerFriendlyName}! An agent will be with you in just a moment.`,
      author: "Concierge",
    })
    .then(() => {
      logInterimAction("(async) Welcome message sent");
    })
    .catch((e: { message: any }) => {
      logInterimAction(`(async) Couldn't send welcome message: ${e?.message}`);
    });
};

const createToken = (
  ACCOUNT_SID: string,
  API_KEY: string,
  API_SECRET: string,
  identity: string
) => {
  logInterimAction("Creating new token");
  const { AccessToken } = Twilio.jwt;
  const { ChatGrant } = AccessToken;

  const chatGrant = new ChatGrant({
    serviceSid: process.env.CONVERSATIONS_SERVICE_SID,
  });

  const token = new AccessToken(ACCOUNT_SID, API_KEY, API_SECRET, {
    identity,
    ttl: TOKEN_TTL_IN_SECONDS,
  });
  token.addGrant(chatGrant);
  const jwt = token.toJwt();
  logInterimAction("New token created");
  return jwt;
};

const logInterimAction = (...strings: any[]) => {
  console.log("  --  ", ...strings);
};

const logInitialAction = (...strings: any[]) => {
  console.log("⏱ ", ...strings);
};

const logFinalAction = (...strings: any[]) => {
  console.log("✅  ", ...strings);
};
