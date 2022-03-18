import { AnyAction, Reducer } from "redux";

import { NotificationState } from "./definitions";
import { ACTION_ADD_NOTIFICATION, ACTION_REMOVE_NOTIFICATION } from "./actions/actionTypes";

const initialState: NotificationState = [];

export const NotificationReducer: Reducer = (
    state: NotificationState = initialState,
    action: AnyAction
): NotificationState => {
    switch (action.type) {
        case ACTION_ADD_NOTIFICATION:
            return [...state, action.payload.notification];
        case ACTION_REMOVE_NOTIFICATION:
            return state.filter((notification) => notification.id !== action.payload.id);
        default:
            return state;
    }
};
