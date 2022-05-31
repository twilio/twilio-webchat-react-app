import { BoxStyleProps } from "@twilio-paste/core/box";

export const formStyles: BoxStyleProps = {
    borderTopColor: "colorBorderWeaker",
    borderTopWidth: "borderWidth10",
    borderTopStyle: "solid",
    padding: "space20"
};

export const innerInputStyles: BoxStyleProps = {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start"
};

export const textAreaContainerStyles: BoxStyleProps = {
    marginTop: "auto",
    marginBottom: "auto",
    flex: 1
};

export const messageOptionContainerStyles: BoxStyleProps = {
    margin: "space30",
    marginLeft: "space20",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "left",

    _notLast: {
        marginRight: "space0"
    }
};

export const filePreviewContainerStyles: BoxStyleProps = {
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
    maxHeight: "300px",
    position: "relative",
    paddingLeft: "space30",
    paddingRight: "space30"
};
