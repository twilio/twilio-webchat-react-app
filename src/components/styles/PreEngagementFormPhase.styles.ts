import { BoxStyleProps } from "@twilio-paste/core/box";
import { TextStyleProps } from "@twilio-paste/core/text";

export const formStyles: BoxStyleProps = {
    padding: "space40",
    paddingTop: "space80",
    overflow: "auto",
    background: "inherit",
    backgroundColor: "colorBackgroundBrand"
};

export const titleStyles: TextStyleProps = {
    fontSize: "fontSize70",
    marginBottom: "space20",
    marginTop: "space150",
    color: "colorTextWeaker",
    paddingX: "space100"
};

export const introStyles: TextStyleProps = {
    fontSize: "fontSize70",
    lineHeight: "lineHeight70",
    marginBottom: "space70",
    color: "colorTextSuccess",
    paddingX: "space100"
};

export const fieldStyles: BoxStyleProps = {
    marginBottom: "space70",
    paddingX: "space100"
};
