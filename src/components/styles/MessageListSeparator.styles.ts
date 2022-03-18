import { BoxStyleProps } from "@twilio-paste/core/box";
import { TextStyleProps } from "@twilio-paste/core/text";

import { SeparatorType } from "../definitions";

export const separatorContainerStyles: BoxStyleProps = {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "space30",
    marginBottom: "space60"
};

export const getSeparatorLineStyles = (separatorType: SeparatorType): BoxStyleProps => ({
    flex: "1",
    borderStyle: "solid",
    borderColor: separatorType === "new" ? "colorBorderError" : "colorBorderWeak",
    borderWidth: "borderWidth0",
    borderTopWidth: "borderWidth10"
});

export const getSeparatorTextStyles = (separatorType: SeparatorType): TextStyleProps => ({
    fontSize: "fontSize20",
    marginLeft: "space40",
    marginRight: "space40",
    color: separatorType === "new" ? "colorTextError" : "colorText"
});
