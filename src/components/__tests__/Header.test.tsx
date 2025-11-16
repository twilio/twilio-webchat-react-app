import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Header } from "../Header";

// Mock the Redux hooks
jest.mock('react-redux', () => ({
    useSelector: jest.fn((selector) => {
        // Mock the selector calls
        if (selector.toString().includes('conversation')) {
            return null;
        }
        if (selector.toString().includes('conversationState')) {
            return 'active';
        }
        return undefined;
    }),
}));

// Mock the useServiceRating hook
jest.mock('../../hooks/useServiceRating', () => ({
    useServiceRating: () => ({
        openRatingModal: jest.fn(),
    }),
}));

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

        expect(queryByText("AnyVan Chat")).toBeInTheDocument();
    });
});
