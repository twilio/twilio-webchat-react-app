import { useContext } from "react";
import { useSelector } from "react-redux";

import { AppState } from "../store/definitions";
import { I18nContext } from "../i18n/i18n.context";

export const useTranslation = () => {
    const brand = useSelector((state: AppState) => state.config.brand);
    const locale = useSelector((state: AppState) => state.config.locale);

    const { i18n } = useContext(I18nContext);

    return { i18n: i18n[brand || "LUUNA"][locale || "es-MX"] };
};
