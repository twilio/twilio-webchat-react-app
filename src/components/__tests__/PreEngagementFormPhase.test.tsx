import { fireEvent, render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";

import { PreEngagementFormPhase } from "../PreEngagementFormPhase";
import * as initAction from "../../store/actions/initActions";
import { EngagementPhase } from "../../store/definitions";
import { sessionDataHandler } from "../../sessionDataHandler";
import { store } from "../../store/store";

const token = "token";
const conversationSid = "sid";
jest.mock("../../sessionDataHandler", () => ({
    sessionDataHandler: {
        fetchAndStoreNewSession: () => ({ token, conversationSid })
    }
}));

jest.mock("../Header", () => ({
    Header: () => <div title="Header" />
}));

jest.mock("../NotificationBar", () => ({
    NotificationBar: () => <div title="NotificationBar" />
}));

const withStore = (Component: React.ReactElement) => <Provider store={store}>{Component}</Provider>;

describe("Pre Engagement Form Phase", () => {
    const namePlaceholderText = "Please enter your name";
    const emailPlaceholderText = "Please enter your email address";
    const queryPlaceholderText = "Ask a question";
    const nameLabelText = "Name";
    const emailLabelText = "Email address";
    const queryLabelText = "How can we help you?";

    beforeEach(() => {
        jest.spyOn(initAction, "initSession").mockImplementation((data: any) => data);
    });

    it("renders the pre-engagement form", () => {
        const { container } = render(withStore(<PreEngagementFormPhase />));

        expect(container).toBeInTheDocument();
    });

    it("renders the header", () => {
        const { queryByTitle } = render(withStore(<PreEngagementFormPhase />));

        expect(queryByTitle("Header")).toBeInTheDocument();
    });

    it("renders the notification bar", () => {
        const { queryByTitle } = render(withStore(<PreEngagementFormPhase />));

        expect(queryByTitle("NotificationBar")).toBeInTheDocument();
    });

    it("renders the pre-engagement form inputs and labels", () => {
        const { getByPlaceholderText, getByText } = render(withStore(<PreEngagementFormPhase />));
        const nameInput = getByPlaceholderText(namePlaceholderText);
        const emailInput = getByPlaceholderText(emailPlaceholderText);
        const queryInput = getByPlaceholderText(queryPlaceholderText);
        const nameLabel = getByText(nameLabelText);
        const emailLabel = getByText(emailLabelText);
        const queryLabel = getByText(queryLabelText);

        expect(nameInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();
        expect(queryInput).toBeInTheDocument();
        expect(nameLabel).toBeInTheDocument();
        expect(emailLabel).toBeInTheDocument();
        expect(queryLabel).toBeInTheDocument();
    });

    it("changes engagement phase to loading on submit", () => {
        const { container } = render(withStore(<PreEngagementFormPhase />));
        const formBox = container.querySelector("form") as HTMLFormElement;
        fireEvent.submit(formBox);
        expect(store.getState().session.currentPhase).toBe(EngagementPhase.Loading);
    });

    it("initializes session with correct arguments on submit", async () => {
        const { container } = render(withStore(<PreEngagementFormPhase />));
        const formBox = container.querySelector("form") as HTMLFormElement;
        fireEvent.submit(formBox);

        await waitFor(() => {
            expect(initAction.initSession).toHaveBeenCalledWith({ token, conversationSid });
        });
    });

    it("renders name input value", () => {
        const { getByPlaceholderText } = render(withStore(<PreEngagementFormPhase />));

        const nameInput = getByPlaceholderText(namePlaceholderText);
        const name = "John";
        fireEvent.change(nameInput, { target: { value: name } });

        expect(nameInput).toHaveValue(name);
    });

    it("renders email input value", () => {
        const { getByPlaceholderText } = render(withStore(<PreEngagementFormPhase />));

        const emailInput = getByPlaceholderText(emailPlaceholderText);
        const email = "john@gmail.com";
        fireEvent.change(emailInput, { target: { value: email } });

        expect(emailInput).toHaveValue(email);
    });

    it("renders query input value", () => {
        const { getByPlaceholderText } = render(withStore(<PreEngagementFormPhase />));

        const queryInput = getByPlaceholderText(queryPlaceholderText);
        const query = "Why is a potato?";
        fireEvent.change(queryInput, { target: { value: query } });

        expect(queryInput).toHaveValue(query);
    });

    it("creates session with correct input values on submit", () => {
        const fetchAndStoreNewSessionSpy = jest.spyOn(sessionDataHandler, "fetchAndStoreNewSession");

        const { container, getByPlaceholderText } = render(withStore(<PreEngagementFormPhase />));
        const formBox = container.querySelector("form") as HTMLFormElement;
        const nameInput = getByPlaceholderText(namePlaceholderText);
        const emailInput = getByPlaceholderText(emailPlaceholderText);
        const queryInput = getByPlaceholderText(queryPlaceholderText);

        const name = "John";
        const email = "email@email.email";
        const query = "Why is a potato?";
        fireEvent.change(nameInput, { target: { value: name } });
        fireEvent.change(emailInput, { target: { value: email } });
        fireEvent.change(queryInput, { target: { value: query } });
        fireEvent.submit(formBox);

        expect(fetchAndStoreNewSessionSpy).toHaveBeenCalledWith({ formData: { friendlyName: name, query, email } });
    });
});
