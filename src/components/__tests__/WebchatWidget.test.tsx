import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { WebchatWidget } from "../WebchatWidget";
import { sessionDataHandler } from "../../sessionDataHandler";
import * as genericActions from "../../store/actions/genericActions";
import * as initActions from "../../store/actions/initActions";
import { EngagementPhase } from "../../store/definitions";
import WebChatLogger from "../../logger";

jest.mock("react-redux", () => ({
    useDispatch: () => jest.fn(),
    useSelector: jest.fn()
}));

jest.mock("../../sessionDataHandler", () => ({
    sessionDataHandler: {
        tryResumeExistingSession: jest.fn(),
        getRegion: jest.fn()
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

jest.mock("../../logger");

beforeAll(() => {
    Object.defineProperty(window, "Twilio", {
        value: {
            getLogger(className: string) {
                return new WebChatLogger(className);
            }
        }
    });
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("Webchat Lite", () => {
    const sessionData = {
        token: "token",
        conversationSid: "sid"
    };
    const region = "stage";

    beforeEach(() => {
        (sessionDataHandler.tryResumeExistingSession as jest.Mock).mockReturnValue(sessionData);
        (sessionDataHandler.getRegion as jest.Mock).mockReturnValueOnce(region);
    });

    it("renders Webchat Lite", () => {
        const { container } = render(<WebchatWidget />);

        expect(container).toBeInTheDocument();
    });

    it("renders the root container", () => {
        const { queryByTitle } = render(<WebchatWidget />);

        expect(queryByTitle("RootContainer")).toBeInTheDocument();
    });

    it("initializes session with fetched session data", () => {
        const initSessionSpy = jest.spyOn(initActions, "initSession");

        render(<WebchatWidget />);

        expect(initSessionSpy).toHaveBeenCalledWith({
            token: sessionData.token,
            conversationSid: sessionData.conversationSid
        });
    });

    it("start pre-engagement form if no pre-existing session data", () => {
        (sessionDataHandler.tryResumeExistingSession as jest.Mock).mockReturnValueOnce(null);
        const changeEngagementPhaseSpy = jest.spyOn(genericActions, "changeEngagementPhase");

        render(<WebchatWidget />);

        expect(changeEngagementPhaseSpy).toHaveBeenCalledWith({ phase: EngagementPhase.PreEngagementForm });
    });

    it("start pre-engagement form if session initialization failed", () => {
        (initActions.initSession as jest.Mock).mockImplementationOnce(() => {
            throw new Error("Failed Initialization");
        });
        const changeEngagementPhaseSpy = jest.spyOn(genericActions, "changeEngagementPhase");

        render(<WebchatWidget />);

        expect(changeEngagementPhaseSpy).toHaveBeenCalledWith({ phase: EngagementPhase.PreEngagementForm });
    });
});
