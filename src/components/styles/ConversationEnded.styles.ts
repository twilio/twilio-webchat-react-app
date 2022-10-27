import { BoxStyleProps } from "@twilio-paste/core/box";
import { TextStyleProps } from "@twilio-paste/core/text";

export const containerStyles: BoxStyleProps = {
    padding: "space60",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    backgroundColor: "colorBackground",
    textAlign: "center"
};

export const titleStyles: TextStyleProps = {
    fontSize: "fontSize50"
};

export const textStyles: TextStyleProps = {
    marginBottom: "space50",
    marginTop: "space50"
};

export const buttonStyles: BoxStyleProps = {
    display: "flex",
    alignItems: "center",
    minWidth: "170px"
};

export const progressStyles: BoxStyleProps = {
    display: "flex",
    flexDirection: "column",
    marginLeft: "space60",
    alignItems: "flex-start"
};
