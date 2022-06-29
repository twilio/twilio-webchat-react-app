import { Message } from "@twilio/conversations";
import { Box } from "@twilio-paste/core/box";
import { ScreenReaderOnly } from "@twilio-paste/core";
import { useSelector } from "react-redux";
import { Text } from "@twilio-paste/core/text";
import { Flex } from "@twilio-paste/core/flex";
import { UserIcon } from "@twilio-paste/icons/esm/UserIcon";
import React, { KeyboardEvent, RefObject, useCallback, useMemo, useRef, useState } from "react";
import log from "loglevel";

import { AppState } from "../store/definitions";
import { parseMessageBody } from "../utils/parseMessageBody";
import {
    getAvatarContainerStyles,
    getInnerContainerStyles,
    authorStyles,
    bodyStyles,
    outerSelectableContainerStyles,
    bubbleAndAvatarContainerStyles
} from "./styles/MessageBubble.styles";

export const SelectableMessageGroup = ({
    message,
    updateFocus,
    isLastOfUserGroup = false
}: {
    message: Message;
    isLastOfUserGroup: boolean;
    updateFocus: (newFocus: number) => void;
}) => {
    const { selections } = message.attributes as unknown & { selections: string[] };
    const refs = useRef(Array.from({ length: selections.length }, () => React.createRef()));
    const [disabled, setDisabled] = useState(false);
    const { conversation, conversationsClient, users } = useSelector((state: AppState) => ({
        conversation: state.chat.conversation,
        conversationsClient: state.chat.conversationsClient,
        users: state.chat.users
    }));
    const belongsToCurrentUser = message.author === conversationsClient?.user.identity;

    const onSelectionClick = useCallback(
        (option: string, index: number) => {
            new Promise((resolve) => {
                if (disabled) return;

                if (!conversation) {
                    log.error("Failed sending message: no conversation found");
                    return;
                }
                let preparedMessage = conversation.prepareMessage();
                preparedMessage = preparedMessage.setBody(option);
                resolve(preparedMessage.build().send());
            }).then(() => {
                // set the clicked on text to be bold, then disable the entire selectable message group from further interaction
                const textRef = (refs.current[index] as RefObject<HTMLParagraphElement>).current;
                if (textRef) textRef.style.fontWeight = "bold";
                setDisabled(true);
            });
        },
        [conversation, disabled]
    );

    const author = users?.find((u) => u.identity === message.author)?.friendlyName || message.author;

    const messageGroup = useMemo(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                const newFocusValue = message.index + (e.key === "ArrowUp" ? -1 : 1);
                updateFocus(newFocusValue);
            }
        };

        const handleFocus = () => {
            // Necessary since screen readers can set the focus to any focusable element
            updateFocus(message.index);
        };

        return selections.map((option, index) => {
            const key = `${message.sid}-option-${option}`;
            return (
                <Box
                    {...outerSelectableContainerStyles}
                    key={key}
                    onFocus={handleFocus}
                    onClick={() => onSelectionClick(option, index)}
                    onKeyDown={handleKeyDown}
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
                                <Text
                                    {...authorStyles}
                                    as="p"
                                    aria-hidden
                                    style={{ textOverflow: "ellipsis" }}
                                    title={author}
                                >
                                    {author}
                                </Text>
                                <ScreenReaderOnly as="p">
                                    {belongsToCurrentUser
                                        ? "You sent at"
                                        : `${users?.find((u) => u.identity === message.author)?.friendlyName} sent at`}
                                </ScreenReaderOnly>
                            </Flex>
                            <Text as="p" {...bodyStyles} ref={refs.current[index] as RefObject<HTMLElement>}>
                                {option ? parseMessageBody(option, belongsToCurrentUser) : null}
                            </Text>
                        </Box>
                    </Box>
                </Box>
            );
        });
    }, [message, author, belongsToCurrentUser, isLastOfUserGroup, onSelectionClick, selections, users, updateFocus]);

    return <>{messageGroup}</>;
};
