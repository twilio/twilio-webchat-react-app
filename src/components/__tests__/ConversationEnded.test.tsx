import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useSelector } from "react-redux";

import { ConversationEnded } from "../ConversationEnded";
import * as genericActions from "../../store/actions/genericActions";
import { sessionDataHandler } from "../../sessionDataHandler";
import { EngagementPhase } from "../../store/definitions";

jest.mock("react-redux", () => ({
    ...jest.requireActual("react-redux"),
    useDispatch: () => jest.fn(),
    useSelector: jest.fn()
}));

jest.mock("../../sessionDataHandler", () => ({
    sessionDataHandler: {
        clear: jest.fn()
    }
}));

const user1 = {
    identity: "identity 1",
    friendlyName: "name 1"
};
const user2 = {
    identity: "identity 2",
    friendlyName: "name 2"
};
const message1 = {
    index: 0,
    author: user1.identity,
    dateCreated: new Date("01/01/2021"),
    body: "message 1"
};
const message2 = {
    index: 1,
    author: user2.identity,
    dateCreated: new Date("01/02/2021"),
    body: "message 2"
};

const transcriptConfig = {
    downloadEnabled: true,
    emailEnabled: true
};

const defaultState = {
    chat: {
        conversation: {
            dateCreated: message1.dateCreated,
            getMessagesCount: jest.fn(),
            addListener: jest.fn(),
            removeListener: jest.fn(),
            attributes: {
                preEngagementData: {
                    email: "test@email.com",
                    name: "test",
                    query: "test query"
                }
            }
        },
        conversationsClient: { user: user1 },
        messages: [message1, message2],
        participants: [],
        users: [user1, user2]
    },
    session: {
        preEngagementData: {
            email: "test@email.com",
            name: "test",
            query: "test query"
        }
    },
    config: {
        transcript: transcriptConfig
    }
};

describe("Conversation Ended", () => {
    const newChatButtonText = "Start new chat";
    const transcriptQueryText = "Do you want a transcript of our chat?";
    const downloadTranscriptButtonText = "Download";
    const emailTranscriptButtonText = "Send to my email";

    beforeEach(() => {
        (useSelector as jest.Mock).mockImplementation((callback: any) => callback(defaultState));
    });

    afterEach(() => {
        process.env = Object.assign(process.env, {
            DOWNLOAD_TRANSCRIPT_ENABLED: "true",
            EMAIL_TRANSCRIPT_ENABLED: "true"
        });
    });

    it("renders conversation ended", () => {
        const { container } = render(<ConversationEnded />);

        expect(container).toBeInTheDocument();
    });

    it("renders the new chat button", () => {
        const { queryByText } = render(<ConversationEnded />);
        const newChatButton = queryByText(newChatButtonText);

        expect(newChatButton).toBeInTheDocument();
    });

    it("renders the transcript query text if download or email transcript enabled in config", () => {
        const { queryByText } = render(<ConversationEnded />);
        process.env = Object.assign(process.env, {
            DOWNLOAD_TRANSCRIPT_ENABLED: "true",
            EMAIL_TRANSCRIPT_ENABLED: "false"
        });
        expect(queryByText(transcriptQueryText)).toBeInTheDocument();
        process.env = Object.assign(process.env, {
            DOWNLOAD_TRANSCRIPT_ENABLED: "false",
            EMAIL_TRANSCRIPT_ENABLED: "true"
        });
        expect(queryByText(transcriptQueryText)).toBeInTheDocument();
    });

    it("does not render the transcript query text if download and email transcript disabled in config", () => {
        process.env = Object.assign(process.env, {
            DOWNLOAD_TRANSCRIPT_ENABLED: "false",
            EMAIL_TRANSCRIPT_ENABLED: "false"
        });
        const { queryByText } = render(<ConversationEnded />);
        expect(queryByText(transcriptQueryText)).not.toBeInTheDocument();
    });

    it("renders the download transcript button if enabled in config", () => {
        const { queryByText } = render(<ConversationEnded />);
        expect(queryByText(downloadTranscriptButtonText)).toBeInTheDocument();
    });

    it("does not render the download transcript button if disabled in config", () => {
        process.env = Object.assign(process.env, {
            DOWNLOAD_TRANSCRIPT_ENABLED: "false",
            EMAIL_TRANSCRIPT_ENABLED: "false"
        });
        const { queryByText } = render(<ConversationEnded />);

        expect(queryByText(downloadTranscriptButtonText)).not.toBeInTheDocument();
    });

    it("renders the email transcript button if enabled in config", () => {
        const { queryByText } = render(<ConversationEnded />);
        expect(queryByText(emailTranscriptButtonText)).toBeInTheDocument();
    });

    it("does not render the email transcript button if disabled in config", () => {
        process.env = Object.assign(process.env, {
            DOWNLOAD_TRANSCRIPT_ENABLED: "true",
            EMAIL_TRANSCRIPT_ENABLED: "false"
        });
        const { queryByText } = render(<ConversationEnded />);

        expect(queryByText(emailTranscriptButtonText)).not.toBeInTheDocument();
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

    it("resets pre-engagement data on new chat button click", () => {
        const updatePreEngagementDataSpy = jest.spyOn(genericActions, "updatePreEngagementData");

        const { queryByText } = render(<ConversationEnded />);
        const newChatButton = queryByText(newChatButtonText) as Element;
        fireEvent.click(newChatButton);

        expect(updatePreEngagementDataSpy).toHaveBeenCalledWith({ email: "", name: "", query: "" });
    });
});
