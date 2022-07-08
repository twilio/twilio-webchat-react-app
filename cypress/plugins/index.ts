/**
 * @type {Cypress.PluginConfig}
 */

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
        getLastMessageText
    });

    // eslint-disable-next-line consistent-return
    on("before:browser:launch", (browser, launchOptions) => {
        if (
            (browser.name === "chrome" || browser.name === "edge" || browser.name === "firefox") &&
            browser.isHeadless
        ) {
            launchOptions.args.push("--disable-gpu");
            return launchOptions;
        }
    });

    return _config;
};
