import { Box, Text } from "@twilio-paste/core";
import { CloseIcon } from "@twilio-paste/icons/esm/CloseIcon";
import { useSelector } from "react-redux";

import { AppState } from "../store/definitions";
import { containerStyles, titleStyles } from "./styles/Header.styles";

export const Header = ({ customTitle }: { customTitle?: string }) => {
    const conversation = useSelector((state: AppState) => state.chat.conversation);
    const conversationState = useSelector((state: AppState) => state.chat.conversationState);

    const handleCloseChat = async () => {
        console.log('🔄 X button clicked - starting customer chat closure process');
        console.log('📊 Current conversation state:', conversationState);
        console.log('💬 Conversation object exists:', Boolean(conversation));
        
        try {
            /*
             * Close the conversation first (like when agent ends chat)
             * The conversation state change will trigger the rating modal automatically
             */
            if (conversation && conversationState !== 'closed') {
                console.log('🔒 Attempting to close conversation via conversation.leave()');
                await conversation.leave();
                console.log('✅ Conversation closed by customer - rating modal will appear automatically');
            } else {
                console.log('ℹ️ Conversation already closed or no conversation object - skipping conversation.leave()');
            }
        } catch (error) {
            console.error('❌ Error closing chat:', error);
            console.error('🔍 Error details:', {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                conversationState,
                hasConversation: Boolean(conversation)
            });
        }
    };

    const isChatActive = conversationState === 'active';

    return (
        <Box as="header" {...containerStyles}>
            <Text as="h2" {...titleStyles}>
                {customTitle || "AnyVan Chat"}
            </Text>
            {isChatActive && (
                <Box
                    as="button"
                    onClick={handleCloseChat}
                    aria-label="Close chat"
                    padding="space20"
                    borderRadius="borderRadius20"
                    backgroundColor="transparent"
                    border="none"
                    cursor="pointer"
                    _hover={{
                        backgroundColor: "colorBackgroundPrimaryWeak",
                        transform: "scale(1.1)"
                    }}
                    transition="all 0.2s"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <CloseIcon decorative={false} title="Close chat" color="colorTextInverse" />
                </Box>
            )}
        </Box>
    );
};
