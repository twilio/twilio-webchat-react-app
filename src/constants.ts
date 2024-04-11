import { ThemeOverride } from "./store/definitions";

// Number of messages fetched at a time from Conversations SDK
export const MESSAGES_LOAD_COUNT = 20;

// The maximum number of characters allowed in message input
export const CHAR_LIMIT = 32 * 1024; // 32kB

// The height of the loading spinner box shown in the message list when fetching new messages
export const MESSAGES_SPINNER_BOX_HEIGHT = 50;

// themes for different brands
export const LUUNA_THEME: ThemeOverride = {
    isLight: true,
    overrides: {
        backgroundColors: {
            colorBackgroundPrimaryStronger: "#235086",
            colorBackgroundPrimary: "#235086"
        }
    }
};

export const NOOZ_THEME: ThemeOverride = {
    isLight: true,
    overrides: {
        backgroundColors: {
            colorBackgroundPrimaryStronger: "rgb(57, 126, 132)",
            colorBackgroundPrimary: "rgb(57, 126, 132)"
        }
    }
};

export const MAPPA_THEME: ThemeOverride = {
    isLight: true,
    overrides: {
        backgroundColors: {
            colorBackgroundPrimaryStronger: "#000000",
            colorBackgroundPrimary: "#000000"
        }
    }
};

export const LUUNA_BRAZIL_THEME: ThemeOverride = {
    isLight: true,
    overrides: {
        backgroundColors: {
            colorBackgroundPrimaryStronger: "rgb(0, 113, 178);",
            colorBackgroundPrimary: "rgb(0, 113, 178);"
        }
    }
};
