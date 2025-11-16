import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { WebchatWidget } from "../WebchatWidget";
import { sessionDataHandler } from "../../sessionDataHandler";
import * as genericActions from "../../store/actions/genericActions";
import * as initActions from "../../store/actions/initActions";
import { EngagementPhase } from "../../store/definitions";

jest.mock("react-redux", () => ({
    useDispatch: () => jest.fn(),
    useSelector: jest.fn()
}));

jest.mock("../../sessionDataHandler", () => ({
    sessionDataHandler: {
        tryResumeExistingSession: jest.fn(),
        clear: jest.fn()
    }
}));

jest.mock("../../store/actions/initActions", () => ({
    initSession: jest.fn()
}));

jest.mock("../../store/actions/genericActions", () => ({
    changeEngagementPhase: jest.fn()
}));

jest.mock("../RootContainer", () => ({
    RootContainer: () => <div title="RootContainer" />
}));

describe("Webchat Lite", () => {
    const sessionData = {
        token: "token",
        conversationSid: "sid"
    };

    beforeEach(() => {
        (sessionDataHandler.tryResumeExistingSession as jest.Mock).mockReturnValue(sessionData);
    });

    it("renders Webchat Lite", () => {
        const { container } = render(<WebchatWidget />);

        expect(container).toBeInTheDocument();
    });

    it("renders the root container", () => {
        const { queryByTitle } = render(<WebchatWidget />);

        expect(queryByTitle("RootContainer")).toBeInTheDocument();
    });

    it("clears session data and starts pre-engagement form", () => {
        const changeEngagementPhaseSpy = jest.spyOn(genericActions, "changeEngagementPhase");

        render(<WebchatWidget />);

        expect(sessionDataHandler.clear).toHaveBeenCalled();
        expect(changeEngagementPhaseSpy).toHaveBeenCalledWith({ phase: EngagementPhase.PreEngagementForm });
    });
});
