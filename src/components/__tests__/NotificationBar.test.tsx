import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { NotificationState } from "../../store/definitions";
import { NotificationBar } from "../NotificationBar";

const mockNotificationState: NotificationState = [
    {
        message: "Test notification 1",
        id: "TestNotification1",
        type: "neutral",
        dismissible: false
    },
    {
        message: "Test notification 2",
        id: "TestNotification2",
        type: "neutral",
        dismissible: false
    }
];

jest.mock("react-redux", () => ({
    ...jest.requireActual("react-redux"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useSelector: (callback: any) => callback({ notifications: mockNotificationState }),
    useDispatch: jest.fn()
}));

describe("Notification Bar", () => {
    it("renders a notification bar", () => {
        const { container } = render(<NotificationBar />);

        expect(container).toBeInTheDocument();
    });

    it("renders a list of notifications", () => {
        const { queryByText } = render(<NotificationBar />);

        expect(queryByText("Test notification 1")).toBeInTheDocument();
        expect(queryByText("Test notification 2")).toBeInTheDocument();
    });
});
