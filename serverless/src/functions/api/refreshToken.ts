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

import jwt from "jsonwebtoken";

const TOKEN_TTL_IN_SECONDS = 60 * 60 * 6;

// ***********************************************************
// Environment Vars
// ***********************************************************
export type MyFunctionContext = {
  [x: string]: any;
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
export type MyEventProperties = {
  token: string;
};

type ValidatedToken = { grants: { identity: string } };

export const handler: ServerlessFunctionSignature<
  MyFunctionContext,
  MyEventProperties
> = async function (
  context: Context<MyFunctionContext>,
  event: MyEventProperties,
  callback: ServerlessCallback
) {
  logInitialAction("Refreshing token");
  const response = new Twilio.Response();
  let providedIdentity: string;

  try {
    const validatedToken: ValidatedToken | unknown = await new Promise(
      (res, rej) =>
        jwt.verify(
          event.token,
          context.API_SECRET,
          {},
          (err: any, decoded: ValidatedToken | unknown) => {
            if (err) return rej(err);
            return res(decoded);
          }
        )
    );

    providedIdentity = (validatedToken as ValidatedToken)?.grants?.identity;
  } catch (e: any) {
    logInterimAction("Invalid token provided:", e.message);
    response.setStatusCode(403);
    return callback(null, response);
  }

  logInterimAction("Token is valid for", providedIdentity);

  const refreshedToken = await createToken(
    context.ACCOUNT_SID,
    context.API_KEY,
    context.API_SECRET,
    providedIdentity
  );

  logFinalAction("Token refreshed");
  return callback(null, {
    token: refreshedToken,
    expiration: Date.now() + TOKEN_TTL_IN_SECONDS * 1000,
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
