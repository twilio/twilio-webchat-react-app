import { fireEvent, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { NotificationBarItem } from "../NotificationBarItem";
import * as genericActions from "../../store/actions/genericActions";
import { Notification } from "../../store/definitions";

jest.mock("react-redux", () => ({
    useDispatch: () => jest.fn()
}));

describe("Notification Bar Item", () => {
    const notification: Notification = {
        message: "Test notification",
        id: "TestNotification",
        type: "neutral",
        dismissible: false
    };

    const dismissButtonTitle = "Dismiss alert";

    it("renders a notification bar item", () => {
        const { container } = render(<NotificationBarItem {...notification} />);

        expect(container).toBeInTheDocument();
    });

    it("renders the provided message", () => {
        const { queryByText } = render(<NotificationBarItem {...notification} />);

        expect(queryByText("Test notification")).toBeInTheDocument();
    });

    it("renders a dismiss button if dismissible is true", () => {
        const { queryByText } = render(<NotificationBarItem {...notification} dismissible={true} />);

        expect(queryByText(dismissButtonTitle)).toBeInTheDocument();
    });

    it("does not render a dismiss button if dismissible is false", () => {
        const { queryByText } = render(<NotificationBarItem {...notification} />);

        expect(queryByText(dismissButtonTitle)).not.toBeInTheDocument();
    });

    it("dismisses notification when dismiss button is clicked", () => {
        const removeNotificationSpy = jest.spyOn(genericActions, "removeNotification");
        const { getByTitle } = render(<NotificationBarItem {...notification} dismissible={true} />);

        const dismissButton = getByTitle(dismissButtonTitle);
        fireEvent.click(dismissButton);

        expect(removeNotificationSpy).toHaveBeenCalledWith(notification.id);
    });

    it("runs onDismiss function prop when dismiss button is clicked", () => {
        const onDismiss = jest.fn();
        const { getByTitle } = render(
            <NotificationBarItem {...notification} dismissible={true} onDismiss={onDismiss} />
        );

        const dismissButton = getByTitle(dismissButtonTitle);
        fireEvent.click(dismissButton);

        expect(onDismiss).toHaveBeenCalled();
    });

    it("dismisses notification only when timeout is finished if set", () => {
        const removeNotificationSpy = jest.spyOn(genericActions, "removeNotification");

        jest.useFakeTimers();
        const onDismiss = jest.fn();
        render(<NotificationBarItem {...notification} timeout={1000} onDismiss={onDismiss} />);

        expect(removeNotificationSpy).not.toHaveBeenCalledWith(notification.id);
        jest.runAllTimers();

        expect(removeNotificationSpy).toHaveBeenCalledWith(notification.id);
        expect(onDismiss).toHaveBeenCalled();
    });
});
