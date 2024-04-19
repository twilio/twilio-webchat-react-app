import { Brand, Locale } from "../definitions";

export type I18n = {
    engagementFormTitle: string;
    engagementFormTitleIcon: string;
    engagementFormSubTitle: string;
    engagementFormButtonSend: string;
    engagementFormLabelInputMessage: string;
    messagingInput: string;
    messagingChatStarted: string;
    messagingIsTyping: string;
    messagingRead: string;
    messagingAreNotSupport: string;
    messagingSeparatorNew: string;
    messagingSeparatorToday: string;
    messagingSeparatorYesterday: string;
    messagingDropFileOrImage: string;
    notificationFileAttachmentAlreadyAttached: string;
    notificationFileAttachmentSizeExceeded: string;
    notificationFileAttachmentTypeNotSupported: string;
    notificationFileDownloadSizeExceeded: string;
    notificationFileDownloadTypeNotSupported: string;
    notificationNoConnection: string;
    notificationSomethingWentWrong: string;
    notificationPleaseTryAgain: string;
    notificationFailedToInitSession: string;
};

export interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    i18n: {
        [key in Brand]: {
            [x in Locale]: I18n;
        };
    };
}
