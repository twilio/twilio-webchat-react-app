import { BoxStyleProps } from "@twilio-paste/core/box";

export const getContainerStyles = (isMobile: boolean): BoxStyleProps => {
    return {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "colorBackgroundBrandStronger",
        padding: "space20",
        paddingTop: "space90",
        paddingBottom: "space60",
        paddingX: "space100",
        borderTopLeftRadius: "borderRadius30",
        borderTopRightRadius: "borderRadius30",
        ...(isMobile && {
            borderRadius: "borderRadius0"
        })
    };
};
