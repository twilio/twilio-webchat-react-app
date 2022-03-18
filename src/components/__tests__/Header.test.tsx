import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Header } from "../Header";

describe("Header", () => {
    it("renders the header", () => {
        const { container } = render(<Header />);

        expect(container).toBeInTheDocument();
    });

    it("renders header with custom title", () => {
        const customTitle = "Chat Title";
        const { queryByText } = render(<Header customTitle={customTitle} />);

        expect(queryByText(customTitle)).toBeInTheDocument();
    });

    it("renders header with default text when no custom title provided", () => {
        const { queryByText } = render(<Header />);

        expect(queryByText("Live Chat")).toBeInTheDocument();
    });
});
