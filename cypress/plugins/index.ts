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

    return _config;
};
