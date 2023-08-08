require('dotenv').config();
import { defineConfig } from "cypress";
import * as fs from "fs";
import * as JSZip from "jszip";

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
                unzip({ source, downloadDirectory }) {
                    const unzipped = fs.readFileSync(source);
                    const jszip = new JSZip();
                    jszip.loadAsync(unzipped).then((result) => {
                        const keys = Object.keys(result.files);
                        for (const key of keys) {
                            const item = result.files[key];
                            if (item.dir) {
                                fs.mkdirSync(`${downloadDirectory}/${item.name}`);
                            } else {
                                item.async("nodebuffer").then((content) => {
                                    fs.writeFileSync(`${downloadDirectory}/${item.name}`, content);
                                });
                            }
                        }
                        fs.unlinkSync(source);
                        return null;
                    });
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