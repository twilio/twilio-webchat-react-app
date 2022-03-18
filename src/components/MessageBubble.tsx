import { Media, Message } from "@twilio/conversations";
import { Box } from "@twilio-paste/core/box";
import { ScreenReaderOnly } from "@twilio-paste/core";
import { useSelector } from "react-redux";
import { Text } from "@twilio-paste/core/text";
import { Flex } from "@twilio-paste/core/flex";
import { UserIcon } from "@twilio-paste/icons/esm/UserIcon";
import { Key, KeyboardEvent, useEffect, useRef, useState } from "react";
import { SuccessIcon } from "@twilio-paste/icons/esm/SuccessIcon";

import { AppState } from "../store/definitions";
import { FilePreview } from "./FilePreview";
import { parseMessageBody } from "../utils/parseMessageBody";
import {
    getAvatarContainerStyles,
    getInnerContainerStyles,
    authorStyles,
    timeStampStyles,
    bodyStyles,
    outerContainerStyles,
    readStatusStyles,
    bubbleAndAvatarContainerStyles
} from "./styles/MessageBubble.styles";

const doubleDigit = (number: number) => `${number < 10 ? 0 : ""}${number}`;

export const MessageBubble = ({
    message,
    isLast,
    isLastOfUserGroup,
    focusable,
    updateFocus
}: {
    message: Message;
    isLast: boolean;
    isLastOfUserGroup: boolean;
    focusable: boolean;
    updateFocus: (newFocus: number) => void;
}) => {
    const [read, setRead] = useState(false);
    const { conversationsClient, participants, users, fileAttachmentConfig } = useSelector((state: AppState) => ({
        conversationsClient: state.chat.conversationsClient,
        participants: state.chat.participants,
        users: state.chat.users,
        fileAttachmentConfig: state.config.fileAttachment
    }));
    const messageRef = useRef<HTMLDivElement>(null);

    const belongsToCurrentUser = message.author === conversationsClient?.user.identity;

    useEffect(() => {
        if (isLast && participants && belongsToCurrentUser) {
            const getOtherParticipants = participants.filter((p) => p.identity !== conversationsClient?.user.identity);
            setRead(
                Boolean(getOtherParticipants.length) &&
                    getOtherParticipants.every((p) => p.lastReadMessageIndex === message.index)
            );
        } else {
            setRead(false);
        }
    }, [participants, isLast, belongsToCurrentUser, conversationsClient, message]);

    useEffect(() => {
        if (focusable) {
            messageRef.current?.focus();
        }
    }, [focusable]);

    const renderMedia = () => {
        if (fileAttachmentConfig?.enabled) {
            if (!message.attachedMedia) {
                return null;
            }

            return message.attachedMedia.map((media: Media, index: Key) => {
                const file = {
                    name: media.filename,
                    type: media.contentType,
                    size: media.size
                } as File;
                return <FilePreview key={index} file={file} isBubble={true} media={media} focusable={focusable} />;
            });
        }

        return <i>Media messages are not supported</i>;
    };

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

    const author = users?.find((u) => u.identity === message.author)?.friendlyName || message.author;

    return (
        <Box
            {...outerContainerStyles}
            tabIndex={focusable ? 0 : -1}
            onFocus={handleFocus}
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
                        <Text {...timeStampStyles} as="p">
                            {`${doubleDigit(message.dateCreated.getHours())}:${doubleDigit(
                                message.dateCreated.getMinutes()
                            )}`}
                        </Text>
                    </Flex>
                    <Text as="p" {...bodyStyles}>
                        {message.body ? parseMessageBody(message.body, belongsToCurrentUser) : null}
                    </Text>
                    {message.type === "media" ? renderMedia() : null}
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
