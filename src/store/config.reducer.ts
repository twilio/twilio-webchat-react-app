import { AnyAction, Reducer } from "redux";

import { ConfigState } from "./definitions";
import { ACTION_LOAD_CONFIG } from "./actions/actionTypes";

const initialState: ConfigState = {};

export const ConfigReducer: Reducer = (state: ConfigState = initialState, action: AnyAction): ConfigState => {
    switch (action.type) {
        case ACTION_LOAD_CONFIG: {
            return {
                ...state,
                ...action.payload
            };
        }

        default:
            return state;
    }
};
