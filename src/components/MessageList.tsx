import { Box, Text } from "@twilio-paste/core";
import { Message, User } from "@twilio/conversations";
import { useEffect, useRef, useState, UIEvent } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AppState } from "../store/definitions";
import { getMoreMessages } from "../store/actions/genericActions";
import { MessageBubble } from "./MessageBubble";
import { MessageListSeparator } from "./MessageListSeparator";
import { getFirstName } from "../utils/getFirstName";
import {
    messageListStyles,
    outerContainerStyles,
    innerContainerStyles,
    participantTypingStyles
} from "./styles/MessageList.styles";

const MESSAGES_SPINNER_BOX_HEIGHT = 60;

const isFirstOfDateGroup = (message: Message, i: number, messages: Message[]) => {
    const currentMessageDate = message.dateCreated.toDateString();
    const previousMessageDate = messages[i - 1].dateCreated.toDateString();
    return currentMessageDate !== previousMessageDate;
};

const renderChatStarted = () => {
    return <MessageListSeparator separatorType="chatStarted" />;
};

export const MessageList = () => {
    const { messages, participants, users, conversation, conversationsClient } = useSelector((state: AppState) => ({
        messages: state.chat.messages,
        participants: state.chat.participants,
        users: state.chat.users,
        conversation: state.chat.conversation,
        conversationsClient: state.chat.conversationsClient
    }));
    const dispatch = useDispatch();
    const messageListRef = useRef<HTMLDivElement>(null);
    const [focusIndex, setFocusIndex] = useState(-1);
    const [hasLoadedAllMessages, setHasLoadedAllMessages] = useState(false);
    const isLoadingMessages = useRef(false);
    const oldMessagesLength = useRef(0);
    const [shouldFocusLatest, setShouldFocusLatest] = useState(false);

    const updateFocus = (newFocus: number) => {
        if (newFocus < 0 || !messages || !messages.length || newFocus > messages[messages.length - 1].index) {
            return;
        }

        if (shouldFocusLatest) {
            setFocusIndex(messages[messages.length - 1].index);
            setShouldFocusLatest(false);
        } else {
            setFocusIndex(newFocus);
        }
    };

    const scrollToBottom = () => {
        if (!messageListRef.current) {
            return;
        }

        messageListRef.current.scrollTop = 0;
    };

    useEffect(() => {
        const messageListener = (message: Message) => {
            // Should focus latest message if one arrives while messages are not focused
            if (!document.activeElement?.hasAttribute("data-message-bubble")) {
                setShouldFocusLatest(true);
            }

            // Ensure that any new message sent by the current user is within scroll view.
            const belongsToCurrentUser = message.author === conversationsClient?.user.identity;
            if (belongsToCurrentUser) {
                scrollToBottom();
            }
        };

        conversation?.addListener("messageAdded", messageListener);

        return () => {
            conversation?.removeListener("messageAdded", messageListener);
        };
    }, [conversation, conversationsClient]);

    useEffect(() => {
        const checkIfAllMessagesLoaded = async () => {
            const totalMessagesCount = await conversation?.getMessagesCount();
            if (totalMessagesCount) {
                setHasLoadedAllMessages(totalMessagesCount === messages?.length);
            }

            // if messages were added to state, loading is complete
            if (messages && oldMessagesLength.current < messages?.length) {
                isLoadingMessages.current = false;
                oldMessagesLength.current = messages.length;
            }
        };

        checkIfAllMessagesLoaded();
    }, [messages, conversation]);

    const handleScroll = async (event: UIEvent<HTMLDivElement>) => {
        const element = event.target as HTMLDivElement;
        const hasReachedTop =
            element.scrollHeight + element.scrollTop - MESSAGES_SPINNER_BOX_HEIGHT <= element.clientHeight;

        // When reaching the top of all messages, load the next chunk
        if (hasReachedTop && conversation && messages && !hasLoadedAllMessages && !isLoadingMessages.current) {
            isLoadingMessages.current = true;
            oldMessagesLength.current = messages.length;
            const totalMessagesCount = await conversation?.getMessagesCount();

            if (totalMessagesCount && messages.length < totalMessagesCount) {
                dispatch(getMoreMessages({ anchor: totalMessagesCount - messages.length - 1, conversation }));
            }
        }
    };

    const renderSeparatorIfApplicable = (message: Message, i: number) => {
        const belongsToCurrentUser = message.author === conversationsClient?.user.identity;
        const isFirstUnreadMessage = message.index === (conversation?.lastReadMessageIndex as number) + 1;

        /*
         * Render date separator above the first message which is the first of a certain date
         * (the first message of any chunk cannot compare itself with previous,
         * and the i = 0 date separator is rendered before "Chat started" section)
         */
        if (i > 0 && isFirstOfDateGroup(message, i, messages as Message[])) {
            return <MessageListSeparator message={message} separatorType="date" />;
        }

        /*
         * Render New separator above the first unread message
         * (messages sent by the current user should be treated as inherently read to avoid flicker)
         */
        if (isFirstUnreadMessage && !belongsToCurrentUser) {
            return <MessageListSeparator message={message} separatorType="new" />;
        }

        return null;
    };

    const renderChatItems = () => {
        if (!messages) {
            return null;
        }

        return messages.map((message: Message, i: number) => {
            const belongsToCurrentUser = message.author === conversationsClient?.user.identity;
            const isLast = i === messages.length - 1;
            const isLastOfUserGroup =
                i === messages.length - 1 ||
                messages[i + 1].author !== message.author ||
                isFirstOfDateGroup(messages[i + 1], i + 1, messages);

            return (
                <div key={message.sid}>
                    {renderSeparatorIfApplicable(message, i)}
                    <MessageBubble
                        message={message}
                        isLast={isLast}
                        isLastOfUserGroup={isLastOfUserGroup}
                        focusable={focusIndex === message.index}
                        updateFocus={updateFocus}
                    />
                </div>
            );
        });
    };

    const handleFocus = () => {
        if (messages && messages.length > 0) {
            setFocusIndex(messages[messages.length - 1].index);
        }
    };

    return (
        <Box {...messageListStyles}>
            <Box {...outerContainerStyles} onScroll={throttle(handleScroll, 1000)} ref={messageListRef} role="main">
                <Box
                    aria-label="Chat messages"
                    role="log"
                    aria-relevant="additions"
                    {...innerContainerStyles}
                    tabIndex={focusIndex >= 0 ? -1 : 0}
                    onFocus={handleFocus}
                >
                    {renderChatStarted()}
                    {renderChatItems()}
                    {participants
                        ?.filter((p) => p.isTyping && p.identity !== conversationsClient?.user.identity)
                        .map((p) => (
                            <Text {...participantTypingStyles} as="p" key={p.identity}>
                                {getFirstName(users?.find((u) => u.identity === p.identity)?.friendlyName)} is typing...
                            </Text>
                        ))}
                </Box>
            </Box>
        </Box>
    );
};

// Throttle function to limit the frequency of scroll event handling
function throttle<T extends (...args: any[]) => any>(func: T, delay: number): T {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecTime = 0;
    
    return ((...args: any[]) => {
        const currentTime = Date.now();
        
        if (currentTime - lastExecTime > delay) {
            func(...args);
            lastExecTime = currentTime;
        } else {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                func(...args);
                lastExecTime = Date.now();
            }, delay - (currentTime - lastExecTime));
        }
    }) as T;
}
