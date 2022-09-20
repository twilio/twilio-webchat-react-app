/**
 * @type {Cypress.PluginConfig}
 */

import * as fs from "fs";

import * as JSZip from "jszip";
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
        }
    });

    return _config;
};
