import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ConversationEnded } from "../ConversationEnded";
import * as genericActions from "../../store/actions/genericActions";
import { sessionDataHandler } from "../../sessionDataHandler";
import { EngagementPhase } from "../../store/definitions";

jest.mock("react-redux", () => ({
    useDispatch: () => jest.fn()
}));

jest.mock("../../sessionDataHandler", () => ({
    sessionDataHandler: {
        clear: jest.fn()
    }
}));

describe("Conversation Ended", () => {
    const newChatButtonText = "Start new chat";

    it("renders conversation ended", () => {
        const { container } = render(<ConversationEnded />);

        expect(container).toBeInTheDocument();
    });

    it("renders the new chat button", () => {
        const { queryByText } = render(<ConversationEnded />);
        const newChatButton = queryByText(newChatButtonText);

        expect(newChatButton).toBeInTheDocument();
    });

    it("clears session data on new chat button click", () => {
        const clearSessionDataSpy = jest.spyOn(sessionDataHandler, "clear");

        const { queryByText } = render(<ConversationEnded />);
        const newChatButton = queryByText(newChatButtonText) as Element;

        fireEvent.click(newChatButton);

        expect(clearSessionDataSpy).toHaveBeenCalled();
    });

    it("changes engagement phase to engagement form on new chat button click", () => {
        const changeEngagementPhaseSpy = jest.spyOn(genericActions, "changeEngagementPhase");

        const { queryByText } = render(<ConversationEnded />);
        const newChatButton = queryByText(newChatButtonText) as Element;
        fireEvent.click(newChatButton);

        expect(changeEngagementPhaseSpy).toHaveBeenCalledWith({ phase: EngagementPhase.PreEngagementForm });
    });
});
