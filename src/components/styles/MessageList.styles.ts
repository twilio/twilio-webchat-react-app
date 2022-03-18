import { BoxStyleProps } from "@twilio-paste/core/box";
import { TextStyleProps } from "@twilio-paste/core/text";

import { MESSAGES_SPINNER_BOX_HEIGHT } from "../../constants";

export const messageListStyles: BoxStyleProps = {
    flexGrow: 1,
    justifyContent: "flex-end",
    overflow: "auto",
    display: "flex",
    flexDirection: "column-reverse"
};

export const outerContainerStyles: BoxStyleProps = {
    display: "flex",
    flexDirection: "column-reverse",
    flex: "1",
    marginTop: "auto",
    overflow: "auto"
};

export const innerContainerStyles: BoxStyleProps = {
    display: "flex",
    flexDirection: "column",
    padding: "space40",
    flex: 1
};

export const spinnerContainerStyles: BoxStyleProps = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: `${MESSAGES_SPINNER_BOX_HEIGHT}px`
};

export const participantTypingStyles: TextStyleProps = {
    fontSize: "fontSize10",
    fontStyle: "italic",
    color: "colorTextWeak",
    marginTop: "auto"
};

export const conversationEventContainerStyles: BoxStyleProps = {
    textAlign: "center",
    marginTop: "space40",
    marginBottom: "space60"
};

export const conversationEventTitleStyles: TextStyleProps = {
    fontSize: "fontSize20"
};

export const conversationEventDateStyles: TextStyleProps = {
    fontSize: "fontSize20",
    fontStyle: "textStyleItalic",
    color: "colorTextWeak"
};
