import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { LoadingPhase } from "../LoadingPhase";

// Spinner component caused errors
jest.mock("@twilio-paste/core/spinner", () => ({
    Spinner: () => <div title="Authorizing" />
}));

describe("Loading Phase", () => {
    it("renders the loading phase", () => {
        const { container } = render(<LoadingPhase />);

        expect(container).toBeInTheDocument();
    });

    it("renders the spinner", () => {
        const { queryByTitle } = render(<LoadingPhase />);
        const spinner = queryByTitle("Authorizing");

        expect(spinner).toBeInTheDocument();
    });
});
