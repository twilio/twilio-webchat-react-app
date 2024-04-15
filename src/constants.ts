import { ThemeOverride } from "./store/definitions";

// Number of messages fetched at a time from Conversations SDK
export const MESSAGES_LOAD_COUNT = 20;

// The maximum number of characters allowed in message input
export const CHAR_LIMIT = 32 * 1024; // 32kB

// The height of the loading spinner box shown in the message list when fetching new messages
export const MESSAGES_SPINNER_BOX_HEIGHT = 50;

const colors = {
    black: "rgb(0, 0, 0)",
    white: "rgb(255, 255, 255)",
    primaryMappa: "rgb(36, 31, 31)",
    primaryHoverMappa: "rgb(36, 31, 31, 0.9)",
    primaryNooz: "rgb(57, 126, 132)",
    primaryHoverNooz: "rgb(57, 126, 132, 0.9)",
    primaryLuuna: "rgb(53 91 128)",
    primaryHoverLuuna: "rgb(53, 91, 128, 0.9)",
    bgHeaderLuuna: "rgb(57, 76, 127)"
};
// themes for different brands
export const LUUNA_THEME: ThemeOverride = {
    isLight: true,
    overrides: {
        backgroundColors: {
            colorBackgroundPrimaryStronger: colors.primaryHoverLuuna, // HOVER CHAT
            colorBackgroundPrimary: colors.primaryLuuna, // CHAT BUTTON
            colorBackgroundBrandStronger: colors.bgHeaderLuuna, // BACKGROUND HEADER
            colorBackgroundUser: colors.bgHeaderLuuna, // MESSAGE
            colorBackgroundBrand: `linear-gradient(0deg, rgba(255,255,255,1) 0%, rgb(57, 76, 127) 35%)` // BACKGROUND
        },
        fontSizes: {
            fontSize70: "28px"
        },
        radii: {
            borderRadius30: "16px"
        },
        textColors: {
            colorText: colors.black, // TEXT INPUT
            colorTextWeaker: "rgb(202, 210, 231)", // TITLE
            colorTextSuccess: colors.white, // SUBTITLE
            colorTextWeak: colors.black, // PLACEHOLDER
            colorTextIcon: colors.white // ICON CLOSE
        }
    }
};

export const NOOZ_THEME: ThemeOverride = {
    isLight: true,
    overrides: {
        backgroundColors: {
            colorBackgroundPrimaryStronger: colors.primaryHoverNooz, // HOVER CHAT
            colorBackgroundPrimary: colors.primaryNooz, // CHAT BUTTON
            colorBackgroundBrandStronger: "rgb(245 241 239)", // BACKGROUND HEADER
            colorBackgroundUser: colors.primaryNooz, // MESSAGE
            colorBackgroundBrand: "linear-gradient(0deg, rgba(255,255,255,1) 0%, rgb(245 241 239) 35%)" // BACKGROUND
        },
        fontSizes: {
            fontSize70: "28px"
        },
        radii: {
            borderRadius30: "16px"
        },
        textColors: {
            colorText: colors.black, // TEXT INPUT
            colorTextWeaker: "rgb(134, 126, 121)", // TITLE
            colorTextSuccess: colors.black, // SUBTITLE
            colorTextWeak: colors.black, // PLACEHOLDER
            colorTextIcon: colors.black // ICON CLOSE
        }
    }
};

export const MAPPA_THEME: ThemeOverride = {
    isLight: true,
    overrides: {
        backgroundColors: {
            colorBackgroundPrimaryStronger: colors.primaryHoverMappa, // HOVER CHAT
            colorBackgroundPrimary: colors.primaryMappa, // CHAT BUTTON
            colorBackgroundBrandStronger: colors.primaryMappa, // BACKGROUND HEADER
            colorBackgroundUser: colors.primaryMappa, // MESSAGE
            colorBackgroundBrand: `linear-gradient(0deg, rgba(255,255,255,1) 0%, ${colors.primaryMappa} 35%)` // BACKGROUND
        },
        fontSizes: {
            fontSize70: "28px"
        },
        radii: {
            borderRadius30: "16px"
        },
        textColors: {
            colorText: colors.black, // TEXT INPUT
            colorTextWeaker: "rgb(220, 214, 214)", // TITLE
            colorTextSuccess: colors.white, // SUBTITLE
            colorTextWeak: colors.black, // PLACEHOLDER
            colorTextIcon: colors.white // ICON CLOSE
        }
    }
};

export const LUUNA_BRAZIL_THEME: ThemeOverride = {
    isLight: true,
    overrides: {
        backgroundColors: {
            colorBackgroundPrimaryStronger: colors.primaryHoverLuuna, // HOVER CHAT
            colorBackgroundPrimary: colors.primaryLuuna, // CHAT BUTTON
            colorBackgroundBrandStronger: colors.bgHeaderLuuna, // BACKGROUND HEADER
            colorBackgroundUser: colors.bgHeaderLuuna, // MESSAGE
            colorBackgroundBrand: `linear-gradient(0deg, rgba(255,255,255,1) 0%, rgb(57, 76, 127) 35%)` // BACKGROUND
        },
        fontSizes: {
            fontSize70: "28px"
        },
        radii: {
            borderRadius30: "16px"
        },
        textColors: {
            colorText: colors.black, // TEXT INPUT
            colorTextWeaker: "rgb(202, 210, 231)", // TITLE
            colorTextSuccess: colors.white, // SUBTITLE
            colorTextWeak: colors.black, // PLACEHOLDER
            colorTextIcon: colors.white // ICON CLOSE
        }
    }
};
