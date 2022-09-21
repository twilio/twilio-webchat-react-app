import { createStore, compose, applyMiddleware, combineReducers, EmptyObject } from "redux";
import thunk from "redux-thunk";

import { ChatReducer } from "./chat.reducer";
import { ConfigReducer } from "./config.reducer";
import { ChatState, ConfigState, NotificationState, SessionState } from "./definitions";
import { NotificationReducer } from "./notification.reducer";
import { SessionReducer } from "./session.reducer";

const loadState = () => {
    try {
        const serializedState = localStorage.getItem("state");
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return undefined;
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const saveState = (
    state: EmptyObject & {
        chat: ChatState;
        config: ConfigState;
        notifications: NotificationState;
        session: SessionState;
    }
) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem("state", serializedState);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
    }
};

const persistedState = loadState();

const typeWindow = window as unknown as { __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: typeof compose };

const composeEnhancers = typeWindow.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const reducers = combineReducers({
    chat: ChatReducer,
    config: ConfigReducer,
    notifications: NotificationReducer,
    session: SessionReducer
});

// eslint-disable-next-line import/no-unused-modules
export const store = createStore(reducers, persistedState, composeEnhancers(applyMiddleware(thunk)));

store.subscribe(() => {
    saveState(store.getState());
});