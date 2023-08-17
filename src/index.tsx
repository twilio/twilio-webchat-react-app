import merge from "lodash.merge";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { Logger, LogLevelDesc } from "loglevel";

import { store } from "./store/store";
import { WebchatWidget } from "./components/WebchatWidget";
import { sessionDataHandler } from "./sessionDataHandler";
import { initConfig } from "./store/actions/initActions";
import { ConfigState } from "./store/definitions";
import { initLogger, getLogger } from "./logger";
import { InitialConfig } from "./definitions";

const defaultConfig: ConfigState = {
    deploymentKey: "",
    region: "",
    theme: {
        isLight: true
    },
    fileAttachment: {
        enabled: true,
        maxFileSize: 16777216, // 16 MB
        acceptedExtensions: ["jpg", "jpeg", "png", "amr", "mp3", "mp4", "pdf", "txt"]
    },
    transcript: {
        downloadEnabled: false,
        emailEnabled: false,
        emailSubject: (agentNames) => {
            let subject = "Transcript of your chat";
            if (agentNames.length > 0) {
                subject = subject.concat(` with ${agentNames[0]}`);
                agentNames.slice(1).forEach((name) => (subject = subject.concat(` and ${name}`)));
            }
            return subject;
        },
        emailContent: (customerName, transcript) => {
            return `<div><h1 style="text-align:center;">Chat Transcript</h1><p>Hello ${customerName},<br><br>Please see below your transcript, with any associated files attached, as requested.<br><br>${transcript}</p></div>`;
        }
    }
};

const initWebchat = async (config: InitialConfig) => {
    // validations for only supported keys in config
    const validKeys = ["deploymentKey", "region", "theme"];
    const logger = window.Twilio.getLogger("initWebChat");

    // deploymentKey is required
    if (!config || !config.deploymentKey) {
        logger.error("`deploymentKey` is required.");
    }

    for (const key in config) {
        if (!validKeys.includes(key)) {
            logger.warn(`${key} is not supported.`);
        }
    }

    const mergedConfig = merge({}, defaultConfig, config);
    sessionDataHandler.setDeploymentKey(mergedConfig.deploymentKey);
    sessionDataHandler.setRegion(mergedConfig.region);
    store.dispatch(initConfig(mergedConfig));
    const rootElement = document.getElementById("twilio-webchat-widget-root");
    logger.info("Now rendering the webchat");
    render(
        <Provider store={store}>
            <WebchatWidget />
        </Provider>,
        rootElement
    );

    if (window.Cypress) {
        window.store = store;
    }
};

declare global {
    interface Window {
        Twilio: {
            initWebchat: (config: InitialConfig) => void;
            initLogger: (level?: LogLevelDesc) => void;
            getLogger: (className: string) => Logger;
        };
        Cypress: Cypress.Cypress;
        store: typeof store;
    }
}

// Expose `initWebchat` function to window object
Object.assign(window, {
    Twilio: {
        initWebchat,
        initLogger,
        getLogger
    }
});
