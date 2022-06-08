import log from "loglevel";
import { ChangeEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import throttle from "lodash.throttle";
import { useDispatch, useSelector } from "react-redux";
import { Box } from "@twilio-paste/core/box";
import { InputBox } from "@twilio-paste/core/input-box";
import { TextArea } from "@twilio-paste/core/textarea";
import { Button } from "@twilio-paste/core/button";
import { SendIcon } from "@twilio-paste/icons/esm/SendIcon";

import { AppState } from "../store/definitions";
import { AttachFileButton } from "./AttachFileButton";
import { FilePreview } from "./FilePreview";
import { detachFiles } from "../store/actions/genericActions";
import { CHAR_LIMIT } from "../constants";
import {
    formStyles,
    innerInputStyles,
    messageOptionContainerStyles,
    filePreviewContainerStyles,
    textAreaContainerStyles
} from "./styles/MessageInput.styles";

export const MessageInput = () => {
    const dispatch = useDispatch();
    const [text, setText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const { conversation, attachedFiles, fileAttachmentConfig } = useSelector((state: AppState) => ({
        conversation: state.chat.conversation,
        attachedFiles: state.chat.attachedFiles || [],
        fileAttachmentConfig: state.config.fileAttachment
    }));
    const oldAttachmentsLength = useRef((attachedFiles || []).length);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const attachmentsBoxRef = useRef<HTMLDivElement>(null);

    const throttleChange = useMemo(
        () =>
            throttle(() => {
                conversation?.typing();

                // in case the input was already focused, let's make sure to send the `read` status if the customer is typing
                if (conversation?.lastReadMessageIndex !== conversation?.lastMessage?.index) {
                    conversation?.setAllMessagesRead();
                }
            }, 500),
        [conversation]
    );

    const isSubmitDisabled = (!text.trim() && !attachedFiles?.length) || isSending;

    const send = async () => {
        if (isSubmitDisabled) {
            return;
        }
        if (!conversation) {
            log.error("Failed sending message: no conversation found");
            return;
        }
        setIsSending(true);

        let preparedMessage = conversation.prepareMessage();
        preparedMessage = preparedMessage.setBody(text);
        attachedFiles.forEach((file: File) => {
            const formData = new FormData();
            formData.append(file.name, file);
            preparedMessage.addMedia(formData);
        });
        await preparedMessage.build().send();
        setText("");
        dispatch(detachFiles(attachedFiles));
        setIsSending(false);
        textAreaRef.current?.focus();
    };

    const onKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            (e.target as HTMLInputElement).form?.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true })
            );
        }
    };

    const onChange = (val: ChangeEvent<HTMLTextAreaElement>) => {
        setText(val.target.value);

        throttleChange();
    };

    const onFocus = () => {
        conversation?.setAllMessagesRead();
    };

    useEffect(() => {
        textAreaRef.current?.setAttribute("rows", "1");
        textAreaRef.current?.focus();
    }, [textAreaRef]);

    // Ensuring attached files are automatically scrolled to
    useEffect(() => {
        if (!attachmentsBoxRef.current) {
            return;
        }

        if (attachedFiles.length > oldAttachmentsLength.current) {
            (attachmentsBoxRef.current.lastChild as Element)?.scrollIntoView();
        }

        oldAttachmentsLength.current = attachedFiles.length;
    }, [attachedFiles]);

    return (
        <Box
            as="form"
            {...formStyles}
            onSubmit={(e) => {
                e.preventDefault();
                send();
            }}
        >
            <InputBox element="MESSAGE_INPUT_BOX" disabled={isSending}>
                <Box as="div" {...innerInputStyles}>
                    <Box {...textAreaContainerStyles}>
                        <TextArea
                            ref={textAreaRef}
                            data-test="message-input-textarea"
                            placeholder="Type your message"
                            value={text}
                            element="MESSAGE_INPUT"
                            onChange={onChange}
                            onFocus={onFocus}
                            readOnly={isSending}
                            onKeyPress={onKeyPress}
                            maxLength={CHAR_LIMIT}
                        />
                    </Box>
                    <Box {...messageOptionContainerStyles}>
                        {fileAttachmentConfig?.enabled && <AttachFileButton textAreaRef={textAreaRef} />}
                    </Box>
                    <Box {...messageOptionContainerStyles}>
                        <Button
                            data-test="message-send-button"
                            variant="primary_icon"
                            size="icon_small"
                            type="submit"
                            aria-disabled={isSubmitDisabled}
                        >
                            <SendIcon decorative={false} title="Send message" size="sizeIcon30" />
                        </Button>
                    </Box>
                </Box>
                {attachedFiles && (
                    <Box data-test="message-attachments" {...filePreviewContainerStyles} ref={attachmentsBoxRef}>
                        {attachedFiles.map((file, index) => (
                            <FilePreview
                                focusable={true}
                                key={index}
                                file={file}
                                isBubble={false}
                                disabled={isSending}
                            />
                        ))}
                    </Box>
                )}
            </InputBox>
        </Box>
    );
};
