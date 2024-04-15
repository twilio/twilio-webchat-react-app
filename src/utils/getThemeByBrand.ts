import { LUUNA_BRAZIL_THEME, LUUNA_THEME, MAPPA_THEME, NOOZ_THEME } from "../constants";
import { Brand } from "../definitions";
import { ThemeOverride } from "../store/definitions";

export function getThemeByBrand(brand?: Brand): ThemeOverride {
    switch (brand) {
        case "LUUNA":
            return LUUNA_THEME;
        case "NOOZ":
            return NOOZ_THEME;
        case "MAPPA":
            return MAPPA_THEME;
        case "LUUNA_BRAZIL":
            return LUUNA_BRAZIL_THEME;
        default:
            return LUUNA_THEME;
    }
}
