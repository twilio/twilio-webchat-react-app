/**
 * @type {Cypress.PluginConfig}
 */

import * as fs from "fs";

import { config } from "dotenv";

import {
    acceptReservation,
    sendMessage,
    validateAttachmentLink,
    wrapReservation,
    completeReservation,
    getCustomerName,
    getLastMessageMediaData,
    getLastMessageText
} from "./helpers/interactionHandler";

config();

module.exports = (on: any, _config: any) => {
    on("task", {
        acceptReservation,
        sendMessage,
        validateAttachmentLink,
        wrapReservation,
        completeReservation,
        getCustomerName,
        getLastMessageMediaData,
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
        }
    });

    return _config;
};
