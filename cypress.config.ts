require("dotenv").config();

import { getTwilioClient } from "./cypress/plugins/helpers/twilioClient";
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
            on("before:browser:launch", async () => {
                const client = getTwilioClient();
                const [{ sid: workspaceSid }] = await client.taskrouter.workspaces.list();
                const tasks = await client.taskrouter.workspaces(workspaceSid).tasks.list();

                // eslint-disable-next-line no-console
                console.log("proceeding to remove older tasks");
                await Promise.all(
                    tasks.map(async (t) => t.remove())
                );

            });
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
                ...process.env
            };

            return config;
        }
    },
});
