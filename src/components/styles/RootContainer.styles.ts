import { BoxStyleProps } from "@twilio-paste/core/box";

export const outerContainerStyles: BoxStyleProps = {
    position: "fixed",
    bottom: "space80",
    right: "space60",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end"
};

export const innerContainerStyles: BoxStyleProps = {
    boxShadow: "shadow",
    display: "flex",
    flexDirection: "column",
    width: "100vw",
    height: "84vh",
    minHeight: "40px",
    maxHeight: "590px",
    maxWidth: "400px",
    marginBottom: "space50",
    marginLeft: "space60",
    borderRadius: "borderRadius30",
    backgroundColor: "colorBackgroundBody"
};
