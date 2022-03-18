import { AnyAction } from "redux";

import { SessionReducer } from "../session.reducer";
import { EngagementPhase, SessionState, PreEngagementData } from "../definitions";
import {
    ACTION_CHANGE_ENGAGEMENT_PHASE,
    ACTION_CHANGE_EXPANDED_STATUS,
    ACTION_START_SESSION,
    ACTION_UPDATE_SESSION_DATA
} from "../actions/actionTypes";

describe("Session Reducer", () => {
    const initialPreEngagementData: PreEngagementData = {
        email: "",
        name: "",
        query: ""
    };

    const initialState: SessionState = {
        currentPhase: EngagementPhase.Loading,
        expanded: false,
        preEngagementData: initialPreEngagementData
    };

    it("should return initial state", () => {
        // @ts-expect-error This should never happen on practice
        expect(SessionReducer(undefined, {} as AnyAction)).toEqual(initialState);
    });

    it("should handle ACTION_START_SESSION action", () => {
        const token = "token";
        const conversationSid = "conversationSid";

        expect(
            SessionReducer(initialState, {
                type: ACTION_START_SESSION,
                payload: {
                    token,
                    conversationSid,
                    currentPhase: EngagementPhase.Loading
                }
            })
        ).toEqual({
            ...initialState,
            token,
            conversationSid,
            currentPhase: EngagementPhase.Loading
        });
    });

    it("should handle ACTION_UPDATE_SESSION_DATA action", () => {
        const token = "token";
        const conversationSid = "conversationSid";

        expect(
            SessionReducer(initialState, {
                type: ACTION_UPDATE_SESSION_DATA,
                payload: {
                    token,
                    conversationSid
                }
            })
        ).toEqual({
            ...initialState,
            token,
            conversationSid
        });
    });

    it("should handle ACTION_CHANGE_EXPANDED_STATUS action", () => {
        expect(
            SessionReducer(initialState, {
                type: ACTION_CHANGE_EXPANDED_STATUS,
                payload: {
                    expanded: true
                }
            })
        ).toEqual({
            ...initialState,
            expanded: true
        });
    });

    it("should handle ACTION_CHANGE_ENGAGEMENT_PHASE action", () => {
        expect(
            SessionReducer(initialState, {
                type: ACTION_CHANGE_ENGAGEMENT_PHASE,
                payload: {
                    currentPhase: EngagementPhase.PreEngagementForm
                }
            })
        ).toEqual({
            ...initialState,
            currentPhase: EngagementPhase.PreEngagementForm
        });
    });
});
