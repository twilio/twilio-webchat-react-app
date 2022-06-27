/* eslint-disable @typescript-eslint/no-unused-vars */
import { Input } from "@twilio-paste/core/input";
import { Label } from "@twilio-paste/core/label";
import { Box } from "@twilio-paste/core/box";
import { TextArea } from "@twilio-paste/core/textarea";
import { FormEvent } from "react";
import { Button } from "@twilio-paste/core/button";
import { useDispatch, useSelector } from "react-redux";
import { Text } from "@twilio-paste/core/text";
import { Option, Select } from "@twilio-paste/core";

import { sessionDataHandler } from "../sessionDataHandler";
import { addNotification, changeEngagementPhase, updatePreEngagementData } from "../store/actions/genericActions";
import { initSession } from "../store/actions/initActions";
import { AppState, EngagementPhase } from "../store/definitions";
import { Header } from "./Header";
import { notifications } from "../notifications";
import { NotificationBar } from "./NotificationBar";
import { introStyles, fieldStyles, titleStyles, formStyles } from "./styles/PreEngagementFormPhase.styles";

export const PreEngagementFormPhase = () => {
    const { name, dob, query } = useSelector((state: AppState) => state.session.preEngagementData) || {};
    const dispatch = useDispatch();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        dispatch(changeEngagementPhase({ phase: EngagementPhase.Loading }));
        try {
            const data = await sessionDataHandler.fetchAndStoreNewSession({
                formData: {
                    friendlyName: name,
                    dob,
                    query
                }
            });
            dispatch(initSession({ token: data.token, conversationSid: data.conversationSid }));
        } catch (err) {
            dispatch(addNotification(notifications.failedToInitSessionNotification((err as Error).message)));
            dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
        }
    };

    return (
        <>
            <Header />
            <NotificationBar />
            <Box as="form" data-test="pre-engagement-chat-form" onSubmit={handleSubmit} {...formStyles}>
                <Text {...titleStyles} as="h3">
                    Hi there!
                </Text>
                <Text {...introStyles} as="p">
                    We are Cloud City Healthcare and we&#39;re here to help. Press the start button to connect with a
                    live agent.
                </Text>
                {/* <Text {...titleStyles} as="h3">
                    Hi there!
                </Text>
                <Text {...introStyles} as="p">
                    We&#39;re here to help. Please give us some info to get started.
                </Text>
                <Box {...fieldStyles}>
                    <Label htmlFor="name">Name</Label>
                    <Input
                        type="text"
                        placeholder="Please enter your name"
                        name="name"
                        data-test="pre-engagement-chat-form-name-input"
                        value={name}
                        onChange={(e) => dispatch(updatePreEngagementData({ name: e.target.value }))}
                        required
                    />
                </Box>
                <Box {...fieldStyles}>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                        type="date"
                        placeholder="Please enter your email address"
                        name="dob"
                        data-test="pre-engagement-chat-form-email-input"
                        value={dob}
                        onChange={(e) => dispatch(updatePreEngagementData({ dob: e.target.value }))}
                        required
                    />
                </Box>

                <Box {...fieldStyles}>
                    <Label htmlFor="reason">Reason for Visit</Label>
                    <Select id="reason">
                        <Option value="hours">Hours</Option>
                        <Option value="scheduling">Scheduling</Option>
                        <Option value="emergency">Emergency</Option>
                        <Option value="prescription">Prescriptions</Option>
                    </Select>
                </Box>

                <Box {...fieldStyles}>
                    <Label htmlFor="query">How can we help you?</Label>
                    <TextArea
                        placeholder="Ask a question"
                        name="query"
                        data-test="pre-engagement-chat-form-query-textarea"
                        value={query}
                        onChange={(e) => dispatch(updatePreEngagementData({ query: e.target.value }))}
                        required
                    />
                </Box> */}

                <Button variant="primary" type="submit" data-test="pre-engagement-start-chat-button">
                    Start chat
                </Button>
            </Box>
        </>
    );
};
