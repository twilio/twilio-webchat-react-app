require('dotenv').config();
import { defineConfig } from "cypress";
import * as fs from "fs";

import {
    acceptReservation,
    sendMessage,
    validateAttachmentLink,
    wrapReservation,
    completeReservation,
    getCustomerName,
    getLastMessageMediaData,
    getLastMessageAllMediaFilenames,
    getLastMessageText
} from "./cypress/plugins/helpers/interactionHandler";
import { GmailAPIHelper } from "./cypress/plugins/helpers/gmail-api-helper";

export default defineConfig({
    e2e: {
        baseUrl: "http://localhost:3000",
        retries: 0,
        supportFile: "cypress/support/e2e.ts",
        downloadsFolder: "cypress/downloads",
        trashAssetsBeforeRuns: true,
        responseTimeout: 100000,
        setupNodeEvents(on, config) {
            on("task", {
                acceptReservation,
                sendMessage,
                validateAttachmentLink,
                wrapReservation,
                completeReservation,
                getCustomerName,
                getLastMessageMediaData,
                getLastMessageAllMediaFilenames,
                getLastMessageText,
                downloads: (downloadspath) => {
                    try {
                        return fs.readdirSync(downloadspath);
                    } catch (e) {
                        fs.mkdirSync(downloadspath, { recursive: true });
                        return fs.readdirSync(downloadspath);
                    }
                },
                log(message) {
                    // eslint-disable-next-line no-console
                    console.log(message);
                    return null;
                },
                async getReceivedEmails({ oAuthClientOptions, token, count }) {
                    const gmailAPIHelper = new GmailAPIHelper(oAuthClientOptions, token);
                    return gmailAPIHelper.getReceivedEmails(count);
                }
            });
            config.env = {
                ...process.env,
                ...config.env
            };

            return config;
        },
    },
    env: {
        GMAIL_OAUTH_CLIENT_OPTIONS: {
            clientId: "",
            clientSecret: "",
            redirectUri: ""
          },
          GMAIL_TOKEN: {
            refresh_token: ""
          },
          TEST_EMAIL: "test@sbc.com",
          DOWNLOAD_TRANSCRIPT_ENABLED: "false",
          EMAIL_TRANSCRIPT_ENABLED: "false" 
    }
});
