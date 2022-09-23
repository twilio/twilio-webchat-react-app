export enum FileTypes {
    JSON = "test.json",
    JPG = "test.jpg",
    JPG2 = "test2.jpg",
    PNG = "test.png",
    TXT = "test.txt",
    GIF = "test.gif",
    PDF = "test.pdf",
    LARGE_PDF = "largeFile.pdf"
}

export const TIMESTAMP = Date.now();
export const FILEPATH = "/files";

export const CUSTOMER_NAME = "Andy";
export const CORRECT_EMAIL = "customer@example.com";
export const INCORRECT_EMAIL = "customer.email.com";
export const CUSTOMER_WELCOME_TEXT = "Hey there";
export const CUSTOMER_MESSAGE = `Hello from Customer ${TIMESTAMP}`;
export const CUSTOMER_MESSAGE_TEXT_ATTACHMENT = `Text and attachment ${TIMESTAMP}`;
export const CUSTOMER_MESSAGE_ATTACHMENT_TEXT = `Attachment and text ${TIMESTAMP}`;
export const AGENT_MESSAGE = `Hello from Agent ${TIMESTAMP}`;

export const EMPTY_FIELD_ERROR_MESSAGE = /Please fill (?:in|out) this field/;
export const INVALID_FILE_ERROR = /Please try a different file./;
export const LARGE_FILE_ERROR = /because the file is too large./;
export const INCORRECT_EMAIL_ERROR_MESSAGE_CHROME = new RegExp(
    `Please include an '@' in the email address. '${INCORRECT_EMAIL}' is missing an '@'.`
);
export const INCORRECT_EMAIL_ERROR_MESSAGE_FIREFOX = new RegExp(`Please enter an email address.`);
