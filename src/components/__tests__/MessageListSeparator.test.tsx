import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Message } from "@twilio/conversations";

import { MessageListSeparator } from "../MessageListSeparator";

const message = {
    index: 0,
    author: "author",
    dateCreated: new Date("01/01/2021"),
    body: "message body"
} as Message;

describe("Message List Separator", () => {
    it("renders the message list separator", () => {
        const { container } = render(<MessageListSeparator message={message} separatorType="date" />);

        expect(container).toBeInTheDocument();
    });

    it("renders a new separator correctly", () => {
        const { queryAllByRole, queryByText } = render(<MessageListSeparator message={message} separatorType="new" />);

        expect(queryAllByRole("separator")).toHaveLength(1);
        expect(queryByText("New")).toBeInTheDocument();
    });

    it("renders a date separator for today's date correctly", () => {
        const today = new Date();
        const { queryAllByRole, queryByText } = render(
            <MessageListSeparator message={{ ...message, dateCreated: today } as Message} separatorType="date" />
        );

        expect(queryAllByRole("separator")).toHaveLength(1);
        expect(queryByText("Today")).toBeInTheDocument();
    });

    it("renders a date separator for yesturdays's date correctly", () => {
        const yesturday = new Date();
        yesturday.setDate(yesturday.getDate() - 1);

        const { queryAllByRole, queryByText } = render(
            <MessageListSeparator message={{ ...message, dateCreated: yesturday } as Message} separatorType="date" />
        );

        expect(queryAllByRole("separator")).toHaveLength(1);
        expect(queryByText("Yesterday")).toBeInTheDocument();
    });

    it("renders a date separator for an old date correctly", () => {
        const { queryAllByRole, queryByText } = render(<MessageListSeparator message={message} separatorType="date" />);

        expect(queryAllByRole("separator")).toHaveLength(1);
        expect(queryByText(message.dateCreated.toLocaleDateString())).toBeInTheDocument();
    });
});
