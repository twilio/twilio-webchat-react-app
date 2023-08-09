import merge from "lodash.merge";
import { render } from "react-dom";
import { Provider } from "react-redux";

import { store } from "./store/store";
import { WebchatWidget } from "./components/WebchatWidget";
import { initConfig } from "./store/actions/initActions";
import { sessionDataHandler } from "./sessionDataHandler";
import { ConfigState } from "./store/definitions";
import { initLogger } from "./logger";

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

const initWebchat = async (config: ConfigState) => {
    const mergedConfig = merge({}, defaultConfig, config);
    sessionDataHandler.setDeploymentKey(mergedConfig.deploymentKey);
    sessionDataHandler.setRegion(mergedConfig.region);
    store.dispatch(initConfig(mergedConfig));
    initLogger();
    const rootElement = document.getElementById("twilio-webchat-widget-root");

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
            initWebchat: (config: ConfigState) => void;
            getDeploymentKey: () => string;
        };
        Cypress: Cypress.Cypress;
        store: typeof store;
    }
}

// Expose `initWebchat`, `getDeploymentKey` function to window object
Object.assign(window, {
    Twilio: {
        initWebchat,
        getDeploymentKey: sessionDataHandler.getDeploymentKey
    }
});
