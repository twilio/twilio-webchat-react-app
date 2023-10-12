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
    // eslint-disable-next-line no-warning-comments
    // TODO: serverUrl needs to be removed with PR #74
    const validKeys = ["deploymentKey", "region", "theme", "serverUrl", "appStatus"];
    const logger = window.Twilio.getLogger(`InitWebChat`);

    // eslint-disable-next-line no-warning-comments
    // TODO: Returning from here if no deployment key with PR #74
    if (!userConfig?.deploymentKey) {
        logger.error(`deploymentKey must exist to connect to webchat servers`);
    }

    Object.keys(userConfig).forEach((userConfigKey) => {
        if (!validKeys.includes(userConfigKey)) {
            logger.warn(`${userConfigKey} is not supported.`);
        }
    });

    store.dispatch(changeExpandedStatus({ expanded: userConfig.appStatus === "open" }));
    delete userConfig.appStatus;

    const webchatConfig = merge({}, defaultConfig, userConfig);

    sessionDataHandler.setEndpoint(webchatConfig.serverUrl);
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
