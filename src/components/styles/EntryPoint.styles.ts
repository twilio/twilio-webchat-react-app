import { BoxStyleProps } from "@twilio-paste/core/box";

export const containerStyles: BoxStyleProps = {
    border: "none",
    backgroundColor: "#FFC907",
    display: "flex",
    height: "sizeIcon90",
    width: "sizeIcon90",
    fontSize: "fontSize50",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "borderRadiusCircle",
    color: "#000000",
    cursor: "pointer",
    transition: "background-color 0.2s",
    outline: "0px",
    padding: "space0",
    _hover: {
        backgroundColor: "#FFECA8"
    },
    _focusVisible: {
        backgroundColor: "#FFECA8",
        boxShadow: "shadowFocus"
    }
} as unknown as BoxStyleProps;
