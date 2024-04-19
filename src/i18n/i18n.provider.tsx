import { ReactNode, useState } from "react";

import { I18nContext } from "./i18n.context";
import { i18n } from "./i18n";
import { Locale } from "../definitions";

interface I18nProviderProps {
    children: ReactNode;
}

export const I18nProvider = ({ children }: I18nProviderProps) => {
    const [locale, setLocale] = useState<Locale>((navigator.language.slice(0, 2) as Locale) || "es-MX");

    return <I18nContext.Provider value={{ locale, setLocale, i18n }}>{children}</I18nContext.Provider>;
};
