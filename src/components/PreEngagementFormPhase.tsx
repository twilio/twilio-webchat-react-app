import { Box } from "@twilio-paste/core/box";
import { TextArea } from "@twilio-paste/core/textarea";
import { FormEvent } from "react";
import { Button, Text } from "@twilio-paste/core";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "@twilio-paste/theme";

import { sessionDataHandler } from "../sessionDataHandler";
import { addNotification, changeEngagementPhase, updatePreEngagementData } from "../store/actions/genericActions";
import { initSession } from "../store/actions/initActions";
import { AppState, EngagementPhase } from "../store/definitions";
import { Header } from "./Header";
import { introStyles, fieldStyles, titleStyles, formStyles } from "./styles/PreEngagementFormPhase.styles";
import { useTranslation } from "../hooks/useTranslation";
import { NotificationBar } from "./NotificationBar";
import { useNotifications } from "../hooks/useNotifications";

export const PreEngagementFormPhase = () => {
    const { name, email, query } = useSelector((state: AppState) => state.session.preEngagementData) || {};
    const { brand, posProfile } = useSelector((state: AppState) => state.config) || {};
    const dispatch = useDispatch();
    const { i18n } = useTranslation();
    const notifications = useNotifications();
    const theme = useTheme();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        dispatch(changeEngagementPhase({ phase: EngagementPhase.Loading }));
        try {
            const data = await sessionDataHandler.fetchAndStoreNewSession({
                formData: {
                    friendlyName: name,
                    email,
                    query,
                    brand,
                    posProfile
                }
            });
            dispatch(initSession({ token: data.token, conversationSid: data.conversationSid, notifications }));
        } catch (err) {
            dispatch(addNotification(notifications.failedToInitSessionNotification((err as Error).message)));
            dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <>
            <Header />
            <NotificationBar />
            <div>
                <Box
                    style={{
                        background: theme.backgroundColors.colorBackgroundBrand
                    }}
                    as="form"
                    paddingX="space100"
                    data-test="pre-engagement-chat-form"
                    onSubmit={handleSubmit}
                    {...formStyles}
                >
                    <Text {...titleStyles} as="h3">
                        {i18n.engagementFormTitle}
                        <span role="img" aria-label="donut">
                            {i18n.engagementFormTitleIcon}
                        </span>
                    </Text>

                    <Text {...introStyles} as="h4">
                        {i18n.engagementFormSubTitle}
                    </Text>

                    <Box {...fieldStyles}>
                        <TextArea
                            placeholder={i18n.engagementFormLabelInputMessage}
                            name="query"
                            rows={2}
                            data-test="pre-engagement-chat-form-query-textarea"
                            value={query}
                            onChange={(e) => dispatch(updatePreEngagementData({ query: e.target.value }))}
                            onKeyPress={handleKeyPress}
                            required
                        />
                    </Box>
                    <Box paddingX="space100" display="flex" justifyContent="flex-end">
                        <Button variant="primary" type="submit" data-test="pre-engagement-start-chat-button">
                            {i18n.engagementFormButtonSend}
                        </Button>
                    </Box>
                </Box>
            </div>
        </>
    );
};
