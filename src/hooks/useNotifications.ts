import { moduleNotifications } from "../notifications";
import { useTranslation } from "./useTranslation";

export const useNotifications = () => {
    const { i18n } = useTranslation();
    return moduleNotifications(i18n);
};
