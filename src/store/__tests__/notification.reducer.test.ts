import { AnyAction } from "redux";

import { NotificationReducer } from "../notification.reducer";
import { NotificationState, Notification } from "../definitions";
import { ACTION_ADD_NOTIFICATION, ACTION_REMOVE_NOTIFICATION } from "../actions/actionTypes";

describe("Notification Reducer", () => {
    const notification: Notification = {
        message: "Test notification",
        id: "TestNotification",
        type: "neutral",
        dismissible: false
    };

    it("should return the initial state", () => {
        expect(NotificationReducer(undefined, {} as AnyAction)).toEqual([]);
    });

    it("should return the previous state if action is unkwown", () => {
        const previousState: NotificationState = [];
        expect(NotificationReducer(previousState, { type: "UNKNOWN_ACTION" })).toEqual([]);
    });

    it("should handle a notification being added", () => {
        const previousState: NotificationState = [];
        expect(
            NotificationReducer(previousState, {
                type: ACTION_ADD_NOTIFICATION,
                payload: {
                    notification
                }
            })
        ).toEqual([notification]);
    });

    it("should handle a notification being removed", () => {
        const previousState: NotificationState = [notification];
        expect(
            NotificationReducer(previousState, {
                type: ACTION_REMOVE_NOTIFICATION,
                payload: {
                    id: notification.id
                }
            })
        ).toEqual([]);
    });
});
