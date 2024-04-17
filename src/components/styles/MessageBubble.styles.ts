import { BoxStyleProps } from "@twilio-paste/core/box";
import { TextStyleProps } from "@twilio-paste/core/text";

export const outerContainerStyles: BoxStyleProps = {
    display: "flex",
    flexDirection: "column",
    marginBottom: "space40"
};

export const bubbleAndAvatarContainerStyles: BoxStyleProps = {
    display: "flex",
    alignItems: "flex-end"
};

export const getAvatarContainerStyles = (placeholder: boolean): BoxStyleProps => ({
    width: "sizeIcon40",
    height: "sizeIcon40",
    marginRight: "space30",
    borderRadius: "borderRadiusCircle",
    overflow: "hidden",
    flex: "0 0 auto",
    backgroundColor: placeholder ? "transparent" : "colorBackground"
});

export const getInnerContainerStyles = (belongToCurrentUser: boolean): BoxStyleProps => ({
    paddingTop: "space30",
    paddingBottom: "space30",
    paddingLeft: "space40",
    paddingRight: "space40",
    backgroundColor: belongToCurrentUser ? "colorBackgroundUser" : "colorBackground",
    color: belongToCurrentUser ? "colorTextWeakest" : "colorText",
    borderRadius: "borderRadius30",
    marginLeft: belongToCurrentUser ? "auto" : "space0",
    marginRight: belongToCurrentUser ? "space0" : "auto",
    maxWidth: "90%"
});

export const bodyStyles: TextStyleProps = {
    color: "inherit",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word"
};

export const readStatusStyles: TextStyleProps = {
    textAlign: "right",
    fontSize: "fontSize10",
    marginRight: "space20",
    color: "colorText"
};
