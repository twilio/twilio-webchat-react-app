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
export const HTML_TRANSCRIPT_BODY = `<div><h1 style="text-align:center;">Chat Transcript</h1><p>Hello Andy,<br><br>Please see below your transcript, with any associated files attached, as requested.<br><br>Chat with <strong>Andy</strong> and <strong>undefined</strong><br><br><strong>Date:</strong> 23 September 2022<br><strong>Duration:</strong> 12 seconds <br><br>09:58 <i>Andy</i>: Hey there<br><br>09:58 <i>Concierge</i>: Welcome Andy! An agent will be with you in just a moment.<br><br>09:58 <i>Andy</i>: Hello from Customer 1663923504831<br><br>09:58 <i>Andy</i>:  (** Attached file <i>test.png</i> **)<br><br>09:58 <i>Andy</i>:  (** Attached file <i>test.txt</i> **)<br><br>09:59 <i>Andy</i>:  (** Attached file <i>test.jpg</i> **)<br><br>09:59 <i>Andy</i>:  (** Attached file <i>test.jpg</i> **)<br><br>09:59 <i>undefined</i>: Hello from Agent 1663923504831<br><br>09:59 <i>Andy</i>:  (** Attached file <i>test.pdf</i> **)<br><br>09:59 <i>Andy</i>:  (** Attached file <i>test2.jpg</i> **)<br><br>09:59 <i>Andy</i>:  (** Attached file <i>test.jpg</i> **)<br><br>09:59 <i>Andy</i>: Text and attachment 1663923504831 (** Attached file <i>test.jpg</i> **)<br><br>09:59 <i>Andy</i>: Attachment and text 1663923504831 (** Attached file <i>test.jpg</i> **)<br><br></p></div><img src="https://u28952547.ct.sendgrid.net/wf/open?upn=fAlNz2wQoF3qe7QbFAYjVGkZZX2vBu0UHwft9CcyDBOWfMeqSJISKssXCn8zpPE17Jsolyuoc2CISvCTICCtyglLlwpFwkPmP8nUPBJRr3nlgnWZo05df39NfRnXTSxEbg6GsHPSxV-2BOjKCKSoI1AifB2Z-2BhpQdbLDjo4PVqcSJWabtx5BlQ6oQgk8r6P1ldcmCzr6vaenzfjdVMjiJR8TDTTGzezPHglBr5K-2FJGGs0-3D" alt="" width="1" height="1" border="0" style="height:1px !important;width:1px !important;border-width:0 !important;margin-top:0 !important;margin-bottom:0 !important;margin-right:0 !important;margin-left:0 !important;padding-top:0 !important;padding-bottom:0 !important;padding-right:0 !important;padding-left:0 !important;"/>`;
