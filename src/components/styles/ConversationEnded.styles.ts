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
    fontSize: "fontSize50",
    marginBottom: "space50"
};

export const textStyles: TextStyleProps = {
    marginBottom: "space50"
};
