/* eslint-disable */
import { Message } from "@twilio/conversations";
import { Box } from "@twilio-paste/core/box";
import { ScreenReaderOnly } from "@twilio-paste/core";
import { useSelector } from "react-redux";
import { Text } from "@twilio-paste/core/text";
import { Flex } from "@twilio-paste/core/flex";
import { UserIcon } from "@twilio-paste/icons/esm/UserIcon";
import { KeyboardEvent, useRef, useState } from "react";
import { SuccessIcon } from "@twilio-paste/icons/esm/SuccessIcon";
import log from "loglevel";
import { AppState } from "../store/definitions";
import { parseMessageBody } from "../utils/parseMessageBody";
import {
    getAvatarContainerStyles,
    getInnerContainerStyles,
    authorStyles,
    bodyStyles,
    outerSelectableContainerStyles,
    readStatusStyles,
    bubbleAndAvatarContainerStyles
} from "./styles/MessageBubble.styles";

const doubleDigit = (number: number) => `${number < 10 ? 0 : ""}${number}`;

export const SelectableMessage = ({
    onDisable,
    disabled,
    message,
    focusable,
    updateFocus,
    isLastOfUserGroup = false
}: {
    onDisable: ()=>void;
    disabled: boolean;
    message: Message;
    focusable: boolean;
    isLastOfUserGroup: boolean;
    updateFocus: (newFocus: number) => void;
}) => {
    const [chosen, setChosen] = useState(false)
    const [read, setRead] = useState(false);
    const { conversation, conversationsClient, users } = useSelector((state: AppState) => ({
        conversation: state.chat.conversation,
        conversationsClient: state.chat.conversationsClient,
        users: state.chat.users
    }));
    const messageRef = useRef<HTMLDivElement>(null);
    const belongsToCurrentUser = message.author === conversationsClient?.user.identity;
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            const newFocusValue = message.index + (e.key === "ArrowUp" ? -1 : 1);
            updateFocus(newFocusValue);
        }
    };

    const onSelectionClick = async (option: string) => {
        if (disabled) return;

        if (!conversation) {
            log.error("Failed sending message: no conversation found");
            return;
        }

        let preparedMessage = conversation.prepareMessage();
        preparedMessage = preparedMessage.setBody(option);
        await preparedMessage.build().send();
        setChosen(true)
        onDisable()
    };

    const handleFocus = () => {
        // Necessary since screen readers can set the focus to any focusable element
        updateFocus(message.index);
    };

    const author = users?.find((u) => u.identity === message.author)?.friendlyName || message.author;

    return (
        <Box
            {...outerSelectableContainerStyles}
            onFocus={handleFocus}
            onClick={(e) => onSelectionClick(message.body)}
            onKeyDown={handleKeyDown}
            ref={messageRef}
            data-message-bubble
            data-testid="message-bubble"
        >
            <Box {...bubbleAndAvatarContainerStyles}>
                {!belongsToCurrentUser && (
                    <Box {...getAvatarContainerStyles(!isLastOfUserGroup)} data-testid="avatar-container">
                        {isLastOfUserGroup && <UserIcon decorative={true} size="sizeIcon40" />}
                    </Box>
                )}
                <Box {...getInnerContainerStyles(belongsToCurrentUser)}>
                    <Flex hAlignContent="between" width="100%" vAlignContent="center" marginBottom="space20">
                        <Text {...authorStyles} as="p" aria-hidden style={{ textOverflow: "ellipsis" }} title={author}>
                            {author}
                        </Text>
                        <ScreenReaderOnly as="p">
                            {belongsToCurrentUser
                                ? "You sent at"
                                : `${users?.find((u) => u.identity === message.author)?.friendlyName} sent at`}
                        </ScreenReaderOnly>
                        {/* <Text {...timeStampStyles} as="p">
                            {`${doubleDigit(message.dateCreated.getHours())}:${doubleDigit(
                                message.dateCreated.getMinutes()
                            )}`}
                        </Text> */}
                    </Flex>
                    <Text as="p" {...bodyStyles} {...chosen ? {fontWeight: 'fontWeightBold'} : {}}>
                        {message.body ? parseMessageBody(message.body, belongsToCurrentUser) : null}
                    </Text>
                </Box>
            </Box>
            {read && (
                <Flex hAlignContent="right" vAlignContent="center" marginTop="space20">
                    <Text as="p" {...readStatusStyles}>
                        Read
                    </Text>
                    <SuccessIcon decorative={true} size="sizeIcon10" color="colorTextWeak" />
                </Flex>
            )}
        </Box>
    );
};
