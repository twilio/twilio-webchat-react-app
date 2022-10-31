import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useSelector } from "react-redux";
import { Media, Message, User } from "@twilio/conversations";

import { ConversationEnded } from "../ConversationEnded";
import * as genericActions from "../../store/actions/genericActions";
import { sessionDataHandler } from "../../sessionDataHandler";
import { EngagementPhase } from "../../store/definitions";
import {
    Transcript,
    getTranscriptData,
    getAgentNames,
    generateDownloadTranscript,
    generateEmailTranscript
} from "../../utils/generateTranscripts";

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
    const transcriptData: Transcript[] = [
        { author: "John", body: "hi", timeStamp: new Date("December 17, 2022 04:30:10"), attachedMedia: null },
        { author: "Concierge", body: "hi", timeStamp: new Date("December 18, 2022 04:30:10"), attachedMedia: null },
        { author: "Ben", body: "hi", timeStamp: new Date("December 20, 2022 03:24:00"), attachedMedia: null },
        { author: "Samantha", body: "hi", timeStamp: new Date("December 21, 2022 03:24:00"), attachedMedia: null }
    ];
    const customerName = "John";
    const agentNames = ["Ben", "Samantha"];

    beforeEach(() => {
        (useSelector as jest.Mock).mockImplementation((callback: any) => callback(defaultState));
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
        expect(queryByText(transcriptQueryText)).toBeInTheDocument();
        (useSelector as jest.Mock).mockImplementationOnce((callback: any) =>
            callback({
                ...defaultState,
                config: { ...defaultState.config, transcript: { ...transcriptConfig, downloadEnabled: false } }
            })
        );
        expect(queryByText(transcriptQueryText)).toBeInTheDocument();
        (useSelector as jest.Mock).mockImplementationOnce((callback: any) =>
            callback({
                ...defaultState,
                config: { ...defaultState.config, transcript: { ...transcriptConfig, emailEnabled: false } }
            })
        );
        expect(queryByText(transcriptQueryText)).toBeInTheDocument();
    });

    it("does not render the transcript query text if download and email transcript disabled in config", () => {
        (useSelector as jest.Mock).mockImplementationOnce((callback: any) =>
            callback({
                ...defaultState,
                config: {
                    ...defaultState.config,
                    transcript: { ...transcriptConfig, downloadEnabled: false, emailEnabled: false }
                }
            })
        );
        const { queryByText } = render(<ConversationEnded />);

        expect(queryByText(transcriptQueryText)).not.toBeInTheDocument();
    });

    it("renders the download transcript button if enabled in config", () => {
        const { queryByText } = render(<ConversationEnded />);
        expect(queryByText(downloadTranscriptButtonText)).toBeInTheDocument();
    });

    it("does not render the download transcript button if disabled in config", () => {
        (useSelector as jest.Mock).mockImplementationOnce((callback: any) =>
            callback({
                ...defaultState,
                config: { ...defaultState.config, transcript: { ...transcriptConfig, downloadEnabled: false } }
            })
        );
        const { queryByText } = render(<ConversationEnded />);

        expect(queryByText(downloadTranscriptButtonText)).not.toBeInTheDocument();
    });

    it("renders the email transcript button if enabled in config", () => {
        const { queryByText } = render(<ConversationEnded />);
        expect(queryByText(emailTranscriptButtonText)).toBeInTheDocument();
    });

    it("does not render the email transcript button if disabled in config", () => {
        (useSelector as jest.Mock).mockImplementationOnce((callback: any) =>
            callback({
                ...defaultState,
                config: { ...defaultState.config, transcript: { ...transcriptConfig, emailEnabled: false } }
            })
        );
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

    it("retrieves transcript data from store", () => {
        const expectedResult = [
            { attachedMedia: undefined, author: "name 1", body: "message 1", timeStamp: new Date("01/01/2021") },
            { attachedMedia: undefined, author: "name 2", body: "message 2", timeStamp: new Date("01/02/2021") }
        ];
        expect(getTranscriptData(defaultState.chat.messages as Message[], defaultState.chat.users as User[])).toEqual(
            expectedResult
        );
    });

    it("generates transcript for download", () => {
        expect(generateDownloadTranscript(customerName, agentNames, transcriptData)).toEqual(
            `Conversation with ${customerName} and ${agentNames[0]} and ${agentNames[1]}\n\nDate: 17 December 2022\nDuration: 3 days 22 hours 53 minutes 50 seconds \n\n* 04:30  ${customerName}: hi\n\n+ 04:30  Concierge: hi\n\n+ 03:24  ${agentNames[0]}: hi\n\n+ 03:24  ${agentNames[1]}: hi\n\n`
        );
    });

    it("generates transcript for download with file attachments", () => {
        const transcriptMediaData: Transcript[] = [
            {
                author: "John",
                body: "hi",
                timeStamp: new Date("December 17, 2022 04:30:10"),
                attachedMedia: [{ filename: "test.txt" } as Media]
            },
            {
                author: "Concierge",
                body: "hi",
                timeStamp: new Date("December 18, 2022 04:30:10"),
                attachedMedia: [{ filename: "test.txt" } as Media]
            },
            {
                author: "Ben",
                body: "hi",
                timeStamp: new Date("December 20, 2022 03:24:00"),
                attachedMedia: [{ filename: "blah.jpg" } as Media]
            },
            {
                author: "Samantha",
                body: "hi",
                timeStamp: new Date("December 21, 2022 03:24:00"),
                attachedMedia: [{ filename: "blah.png" } as Media]
            }
        ];
        expect(generateDownloadTranscript(customerName, agentNames, transcriptMediaData)).toEqual(
            `Conversation with ${customerName} and ${agentNames[0]} and ${agentNames[1]}\n\nDate: 17 December 2022\nDuration: 3 days 22 hours 53 minutes 50 seconds \n\n* 04:30  ${customerName}: hi (** Attached file test.txt **)\n\n+ 04:30  Concierge: hi (** Attached file test-1.txt **)\n\n+ 03:24  ${agentNames[0]}: hi (** Attached file blah.jpg **)\n\n+ 03:24  ${agentNames[1]}: hi (** Attached file blah.png **)\n\n`
        );
    });

    it("generates transcript for email", () => {
        expect(generateEmailTranscript(customerName, agentNames, transcriptData)).toEqual(
            `Chat with <strong>${customerName}</strong> and <strong>${agentNames[0]}</strong> and <strong>${agentNames[1]}</strong><br><br><strong>Date:</strong> 17 December 2022<br><strong>Duration:</strong> 3 days 22 hours 53 minutes 50 seconds <br><br>04:30 <i>${customerName}</i>: hi<br><br>04:30 <i>Concierge</i>: hi<br><br>03:24 <i>${agentNames[0]}</i>: hi<br><br>03:24 <i>${agentNames[1]}</i>: hi<br><br>`
        );
    });

    it("generates transcript for email with file attachments", () => {
        const transcriptMediaData: Transcript[] = [
            {
                author: "John",
                body: "hi",
                timeStamp: new Date("December 17, 2022 04:30:10"),
                attachedMedia: [{ filename: "test.txt" } as Media]
            },
            {
                author: "Concierge",
                body: "hi",
                timeStamp: new Date("December 18, 2022 04:30:10"),
                attachedMedia: [{ filename: "test.txt" } as Media]
            },
            {
                author: "Ben",
                body: "hi",
                timeStamp: new Date("December 20, 2022 03:24:00"),
                attachedMedia: [{ filename: "blah.jpg" } as Media]
            },
            {
                author: "Samantha",
                body: "hi",
                timeStamp: new Date("December 21, 2022 03:24:00"),
                attachedMedia: [{ filename: "blah.png" } as Media]
            }
        ];
        expect(generateEmailTranscript(customerName, agentNames, transcriptMediaData)).toEqual(
            `Chat with <strong>${customerName}</strong> and <strong>${agentNames[0]}</strong> and <strong>${agentNames[1]}</strong><br><br><strong>Date:</strong> 17 December 2022<br><strong>Duration:</strong> 3 days 22 hours 53 minutes 50 seconds <br><br>04:30 <i>${customerName}</i>: hi (** Attached file <i>test.txt</i> **)<br><br>04:30 <i>Concierge</i>: hi (** Attached file <i>test-1.txt</i> **)<br><br>03:24 <i>${agentNames[0]}</i>: hi (** Attached file <i>blah.jpg</i> **)<br><br>03:24 <i>${agentNames[1]}</i>: hi (** Attached file <i>blah.png</i> **)<br><br>`
        );
    });

    it("gets agent names from transcript data", () => {
        expect(getAgentNames(customerName, transcriptData)).toEqual([agentNames[0], agentNames[1]]);
    });
});
