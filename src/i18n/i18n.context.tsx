import { createContext } from "react";

import { I18nContextType } from "./i18n.interface";
import { i18n } from "./i18n";
import { Locale } from "../definitions";

export const I18nContext = createContext<I18nContextType>({
    locale: "es-MX",
    // eslint-disable-next-line no-console
    setLocale: (locale: Locale) => console.log(locale),
    i18n
});
