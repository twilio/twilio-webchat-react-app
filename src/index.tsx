import merge from "lodash.merge";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { Logger, LogLevelDesc } from "loglevel";

import { store } from "./store/store";
import { WebchatWidget } from "./components/WebchatWidget";
import { sessionDataHandler } from "./sessionDataHandler";
import { initConfig } from "./store/actions/initActions";
import { ConfigState, UserConfig } from "./store/definitions";
import { initLogger, getLogger } from "./logger";
import { changeExpandedStatus } from "./store/actions/genericActions";

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
    }
};

const initWebchat = async (userConfig: UserConfig) => {
    const validKeys = ["deploymentKey", "region", "theme", "appStatus"];
    const logger = window.Twilio.getLogger(`InitWebChat`);

    if (!userConfig || !userConfig.deploymentKey) {
        logger.error(`deploymentKey must exist to connect to Webchat servers`);
        return;
    }

    for (const key in userConfig) {
        if (!validKeys.includes(key)) {
            logger.warn(`${key} is not supported.`);
        }
    }

    store.dispatch(changeExpandedStatus({ expanded: userConfig.appStatus === "open" }));
    delete userConfig.appStatus;

    const webchatConfig = merge({}, defaultConfig, userConfig);

    sessionDataHandler.setRegion(webchatConfig.region);
    sessionDataHandler.setDeploymentKey(webchatConfig.deploymentKey);

    store.dispatch(initConfig(webchatConfig));

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
            initWebchat: (config: ConfigState) => void;
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
