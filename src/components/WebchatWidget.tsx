import { useDispatch, useSelector } from "react-redux";
import { CustomizationProvider, CustomizationProviderProps } from "@twilio-paste/core/customization";
import { CSSProperties, FC, useEffect } from "react";

import { RootContainer } from "./RootContainer";
import { ServiceRating } from "./ServiceRating";
import { AppState, EngagementPhase } from "../store/definitions";
import { sessionDataHandler } from "../sessionDataHandler";
import { changeEngagementPhase } from "../store/actions/genericActions";
import { useServiceRating } from "../hooks/useServiceRating";

const AnyCustomizationProvider: FC<CustomizationProviderProps & { style: CSSProperties }> = CustomizationProvider;

export function WebchatWidget() {
    const theme = useSelector((state: AppState) => state.config.theme);
    const dispatch = useDispatch();
    const { showRatingModal, closeRatingModal, submitRating, handleSkipRating, isLoading } = useServiceRating();

    useEffect(() => {
        // Clear session data on page refresh to ensure fresh start
        sessionDataHandler.clear();
        
        // Always start with pre-engagement form
        dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
    }, [dispatch]);

    const handleRatingSubmit = async (rating: number, feedback?: string) => {
        try {
            await submitRating(rating, feedback);
        } catch (error) {
            console.error('Failed to submit rating:', error);
            // You could show a notification here
        }
    };

    return (
        <AnyCustomizationProvider
            baseTheme={theme?.isLight ? "default" : "dark"}
            theme={theme?.overrides}
            elements={{
                MESSAGE_INPUT: {
                    boxShadow: "none!important" as "none"
                },
                MESSAGE_INPUT_BOX: {
                    display: "inline-block",
                    boxShadow: "none"
                },
                ALERT: {
                    paddingTop: "space30",
                    paddingBottom: "space30"
                },
                BUTTON: {
                    "&[aria-disabled='true'][color='colorTextLink']": {
                        color: "colorTextLinkWeak"
                    }
                }
            }}
            style={{ minHeight: "100%", minWidth: "100%" }}
        >
            <RootContainer />
            <ServiceRating
                isOpen={showRatingModal}
                onClose={closeRatingModal}
                onSubmit={handleRatingSubmit}
                onSkip={handleSkipRating}
                isLoading={isLoading}
            />
        </AnyCustomizationProvider>
    );
}
