import "react-redux";
import "@testing-library/jest-dom";

import { ConfigReducer } from "../config.reducer";
import { ConfigState } from "../definitions";
import { ACTION_LOAD_CONFIG } from "../actions/actionTypes";
import { store } from "../store";

describe("Config Reducer", () => {
    store.getState();
    let configState: ConfigState = {};

    beforeEach(() => {
        configState = {};
    });

    it("updates config state when ACTION_LOAD_CONFIG is dispatched", async () => {
        expect(configState.serverUrl).toBeUndefined();
        const newState: ConfigState = ConfigReducer(
            {},
            {
                type: ACTION_LOAD_CONFIG,
                payload: {
                    serverUrl: "test-endpoint-1"
                }
            }
        );
        expect(newState.serverUrl).toEqual("test-endpoint-1");
    });
});
