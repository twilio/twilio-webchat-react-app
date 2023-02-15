import { BoxStyleProps } from "@twilio-paste/core/box";

export const containerStyles: BoxStyleProps = {
    border: "none",
    backgroundColor: "colorBackgroundPrimary",
    display: "flex",
    fontSize: "fontSize30",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "borderRadius0",
    height: "sizeIcon80",
    color: "colorTextWeakest",
    cursor: "pointer",
    transition: "background-color 0.2s",
    outline: "0px",
    _hover: {
        backgroundColor: "colorBackgroundPrimaryStronger"
    },
    _focusVisible: {
        backgroundColor: "colorBackgroundPrimaryStronger",
        boxShadow: "shadowFocus"
    },
    padding: "space10"
};