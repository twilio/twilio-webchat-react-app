import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useSelector } from "react-redux";

import { EntryPoint } from "../EntryPoint";
import * as genericActions from "../../store/actions/genericActions";

jest.mock("react-redux", () => ({
    useDispatch: () => jest.fn(),
    useSelector: jest.fn()
}));

describe("Entry Point", () => {
    it("renders the entry point", () => {
        const { container } = render(<EntryPoint />);

        expect(container).toBeInTheDocument();
    });

    it("renders the minimize chat button when expanded", () => {
        (useSelector as jest.Mock).mockImplementation((callback: any) => callback({ session: { expanded: true } }));

        const { queryByTitle } = render(<EntryPoint />);

        expect(queryByTitle("Minimize chat")).toBeInTheDocument();
    });

    it("renders the open chat button when un-expanded", () => {
        (useSelector as jest.Mock).mockImplementation((callback: any) => callback({ session: { expanded: false } }));

        const { queryByTitle } = render(<EntryPoint />);

        expect(queryByTitle("Open chat")).toBeInTheDocument();
    });

    it("changes expanded status to false when clicked and already true", () => {
        (useSelector as jest.Mock).mockImplementation((callback: any) => callback({ session: { expanded: true } }));
        const changeExpandedStatusSpy = jest.spyOn(genericActions, "changeExpandedStatus");

        const { container } = render(<EntryPoint />);
        const button = container.firstChild as Element;
        fireEvent.click(button);

        expect(changeExpandedStatusSpy).toHaveBeenCalledWith({ expanded: false });
    });

    it("changes expanded status to true when clicked and already false", () => {
        (useSelector as jest.Mock).mockImplementation((callback: any) => callback({ session: { expanded: false } }));
        const changeExpandedStatusSpy = jest.spyOn(genericActions, "changeExpandedStatus");

        const { container } = render(<EntryPoint />);
        const button = container.firstChild as Element;
        fireEvent.click(button);

        expect(changeExpandedStatusSpy).toHaveBeenCalledWith({ expanded: true });
    });
});
