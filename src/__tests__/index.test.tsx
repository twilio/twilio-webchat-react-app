import "..";
import { Provider } from "react-redux";
import * as reactDom from "react-dom";

import { sessionDataHandler } from "../sessionDataHandler";
import { WebchatWidget } from "../components/WebchatWidget";
import { store } from "../store/store";
import * as initActions from "../store/actions/initActions";

jest.mock("react-dom");

store.dispatch = jest.fn();

describe("Index", () => {
    let { initWebchat, getLogger } = window.Twilio;
    beforeAll(() => {
        getLogger = jest.fn();
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("initWebchat", () => {
        it("renders Webchat Lite correctly", () => {
            const renderSpy = jest.spyOn(reactDom, "render");

            const root = document.createElement("div");
            root.id = "twilio-webchat-widget-root";
            document.body.appendChild(root);
            initWebchat({});

            expect(renderSpy).toBeCalledWith(
                <Provider store={store}>
                    <WebchatWidget />
                </Provider>,
                root
            );
        });

        it("sets endpoint correctly", () => {
            const setEndpointSpy = jest.spyOn(sessionDataHandler, "setEndpoint");

            const serverUrl = "serverUrl";
            initWebchat({ serverUrl });

            expect(setEndpointSpy).toBeCalledWith(serverUrl);
        });

        it("initializes config", () => {
            const initConfigSpy = jest.spyOn(initActions, "initConfig");

            initWebchat({});

            expect(initConfigSpy).toBeCalled();
        });

        it("initializes config with provided config merged with default config", () => {
            const initConfigSpy = jest.spyOn(initActions, "initConfig");

            const serverUrl = "serverUrl";
            initWebchat({ serverUrl });

            expect(initConfigSpy).toBeCalledWith(expect.objectContaining({ serverUrl, theme: { isLight: true } }));
        });
    });
});
