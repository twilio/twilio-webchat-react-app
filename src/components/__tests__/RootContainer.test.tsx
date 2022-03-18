import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useSelector } from "react-redux";

import { EngagementPhase } from "../../store/definitions";
import { RootContainer } from "../RootContainer";

jest.mock("react-redux", () => ({
    useSelector: jest.fn()
}));

jest.mock("../EntryPoint", () => ({
    EntryPoint: () => <div title="EntryPoint" />
}));

jest.mock("../LoadingPhase", () => ({
    LoadingPhase: () => <div title="LoadingPhase" />
}));

jest.mock("../MessagingCanvasPhase", () => ({
    MessagingCanvasPhase: () => <div title="MessagingCanvasPhase" />
}));

jest.mock("../PreEngagementFormPhase", () => ({
    PreEngagementFormPhase: () => <div title="PreEngagementFormPhase" />
}));

describe("Root Container", () => {
    beforeEach(() => {
        (useSelector as jest.Mock).mockImplementation((callback: any) =>
            callback({ session: { expanded: false, currentPhase: null } })
        );
    });

    it("renders the root container", () => {
        const { container } = render(<RootContainer />);

        expect(container).toBeInTheDocument();
    });

    it("renders the entry point", () => {
        const { queryByTitle } = render(<RootContainer />);

        expect(queryByTitle("EntryPoint")).toBeInTheDocument();
    });

    it("renders the loading phase when supplied as phase", () => {
        (useSelector as jest.Mock).mockImplementation((callback: any) =>
            callback({ session: { expanded: true, currentPhase: EngagementPhase.Loading } })
        );

        const { queryByTitle } = render(<RootContainer />);

        expect(queryByTitle("LoadingPhase")).toBeInTheDocument();
    });

    it("renders the messaging canvas phase when supplied as phase", () => {
        (useSelector as jest.Mock).mockImplementation((callback: any) =>
            callback({ session: { expanded: true, currentPhase: EngagementPhase.MessagingCanvas } })
        );

        const { queryByTitle } = render(<RootContainer />);

        expect(queryByTitle("MessagingCanvasPhase")).toBeInTheDocument();
    });

    it("renders pre-engagement form phase when supplied as phase", () => {
        (useSelector as jest.Mock).mockImplementation((callback: any) =>
            callback({ session: { expanded: true, currentPhase: EngagementPhase.PreEngagementForm } })
        );

        const { queryByTitle } = render(<RootContainer />);

        expect(queryByTitle("PreEngagementFormPhase")).toBeInTheDocument();
    });

    it("renders the re-engagement form phase as default phase", () => {
        (useSelector as jest.Mock).mockImplementation((callback: any) =>
            callback({ session: { expanded: true, currentPhase: null } })
        );

        const { queryByTitle } = render(<RootContainer />);

        expect(queryByTitle("PreEngagementFormPhase")).toBeInTheDocument();
    });

    it("does not render phase when not expanded", () => {
        (useSelector as jest.Mock).mockImplementation((callback: any) =>
            callback({ session: { expanded: false, currentPhase: EngagementPhase.MessagingCanvas } })
        );

        const { queryByTitle } = render(<RootContainer />);

        expect(queryByTitle("MessagingCanvasPhase")).not.toBeInTheDocument();
    });
});
