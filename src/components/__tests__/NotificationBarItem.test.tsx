import { fireEvent, queryHelpers, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { NotificationBarItem } from "../NotificationBarItem";
import * as genericActions from "../../store/actions/genericActions";
import { Notification } from "../../store/definitions";

jest.mock("react-redux", () => ({
    useDispatch: () => jest.fn()
}));

export const queryByPasteElement = queryHelpers.queryByAttribute.bind(
  null,
  'data-paste-element',
);

describe("Notification Bar Item", () => {
    const notification: Notification = {
        message: "Test notification",
        id: "TestNotification",
        type: "neutral",
        dismissible: false
    };

    const dismissButtonTitle = "Dismiss alert";
    const dismissPasteElementName = "ALERT_DISMISS_BUTTON";

    it("renders a notification bar item", () => {
        const { container } = render(<NotificationBarItem {...notification} />);

        expect(container).toBeInTheDocument();
    });

    it("renders the provided message", () => {
        const { queryByText } = render(<NotificationBarItem {...notification} />);

        expect(queryByText("Test notification")).toBeInTheDocument();
    });

    it("renders a dismiss button if dismissible is true", () => {
        const { container } = render(<NotificationBarItem {...notification} dismissible={true} />);

        expect(queryByPasteElement(container, dismissPasteElementName)).toBeInTheDocument();
    });

    it("does not render a dismiss button if dismissible is false", () => {
        const { queryByText } = render(<NotificationBarItem {...notification} />);

        expect(queryByText(dismissButtonTitle)).not.toBeInTheDocument();
    });

    it("dismisses notification when dismiss button is clicked", () => {
        const removeNotificationSpy = jest.spyOn(genericActions, "removeNotification");
        const { container } = render(<NotificationBarItem {...notification} dismissible={true} />);

        const dismissButton = queryByPasteElement(container, dismissPasteElementName);
        fireEvent.click(dismissButton as unknown as Element);

        expect(removeNotificationSpy).toHaveBeenCalledWith(notification.id);
    });

    it("runs onDismiss function prop when dismiss button is clicked", () => {
        const onDismiss = jest.fn();
        const { container } = render(
            <NotificationBarItem {...notification} dismissible={true} onDismiss={onDismiss} />
        );

        const dismissButton = queryByPasteElement(container, dismissPasteElementName);
        fireEvent.click(dismissButton as unknown as Element);

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
