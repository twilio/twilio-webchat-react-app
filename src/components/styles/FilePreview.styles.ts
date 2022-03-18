import { BoxStyleProps } from "@twilio-paste/core/box";
import { TextStyleProps } from "@twilio-paste/core/text";

export const outerContainerStyles: BoxStyleProps = {
    position: "relative"
};

export const getContainerStyles = (isBubble: boolean, disabled?: boolean): BoxStyleProps => ({
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    height: "fit-content",
    width: "100%",
    alignItems: "center",
    paddingTop: "space30",
    paddingBottom: "space30",
    paddingLeft: "space30",
    paddingRight: isBubble ? "space30" : "space120",
    marginTop: "space30",
    marginBottom: "space30",
    borderColor: "colorBorderWeak",
    borderWidth: "borderWidth10",
    borderStyle: "solid",
    borderRadius: "borderRadius20",
    background: "inherit",
    color: "inherit",
    _hover: disabled ? {} : { cursor: "pointer", borderColor: "inherit" },
    _focusVisible: disabled ? {} : { boxShadow: "shadowFocus", borderColor: "transparent", outline: "none" }
});

export const fileIconContainerStyles: BoxStyleProps = {
    paddingLeft: "space20",
    paddingRight: "space50"
};

export const actionIconContainerStyles: BoxStyleProps = {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    top: "0px",
    bottom: "0px",
    right: "0px",
    margin: "space50",
    marginRight: "space40",
    color: "colorTextWeaker",
    _hover: {
        color: "inherit"
    }
};

export const fileDescriptionContainerStyles: BoxStyleProps = {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    textAlign: "left"
};

export const fileNameStyles: TextStyleProps = {
    color: "inherit",
    fontWeight: "fontWeightBold",
    fontSize: "fontSize20",
    lineHeight: "lineHeight10"
};

export const fileSizeStyles: TextStyleProps = {
    color: "inherit",
    fontSize: "fontSize10",
    lineHeight: "lineHeight10"
};
