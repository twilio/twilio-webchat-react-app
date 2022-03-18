import { Box } from "@twilio-paste/core/box";
import { Text } from "@twilio-paste/core/text";

import { containerStyles, titleStyles } from "./styles/Header.styles";

export const Header = ({ customTitle }: { customTitle?: string }) => {
    return (
        <Box as="header" {...containerStyles}>
            <Text as="h2" {...titleStyles}>
                {customTitle || "Live Chat"}
            </Text>
        </Box>
    );
};
