import parseMessage from "gmail-api-parse-message";
import { Credentials, OAuth2ClientOptions } from "google-auth-library";
import { google } from "googleapis";
import { OAuth2Client } from "googleapis-common";

export class GmailAPIHelper {
    oAuth2Client: OAuth2Client;

    refreshToken: string;

    constructor(oAuthClientOptions: OAuth2ClientOptions, token: Credentials) {
        this.oAuth2Client = new google.auth.OAuth2(
            oAuthClientOptions.clientId,
            oAuthClientOptions.clientSecret,
            oAuthClientOptions.redirectUri
        );
        this.refreshToken = token.refresh_token;
        this.oAuth2Client.setCredentials(token);
    }

    public async getReceivedEmails(emailCount: number) {
        console.log("inside gmail-api-helper getReceivedEmails...");
        console.log("this.oAuth2Client", this.oAuth2Client);
        console.log("this.refresh_token", this.refreshToken);
        const gmail = google.gmail({ version: "v1", auth: this.oAuth2Client });
        console.log("gmail", gmail);
        const response = await gmail.users.messages.list({ userId: "me", labelIds: ["INBOX"], maxResults: emailCount });
        console.log("response", response);
        console.log("all messages", response.data.messages);
        return Promise.all(
            response.data.messages.map(async (message) => {
                console.log("message inside promise map of responses", message);
                const messageResponse = await this.getEmail(message.id);
                console.log("messageResponse", messageResponse);
                return messageResponse;
                // return parseMessage(messageResponse);
            })
        );
    }

    public async getSentEmails(emailCount: number) {
        const gmail = google.gmail({ version: "v1", auth: this.oAuth2Client });
        const response = await gmail.users.messages.list({ userId: "me", labelIds: ["SENT"], maxResults: emailCount });
        return Promise.all(
            response.data.messages.map(async (message) => {
                const messageResponse = await this.getEmail(message.id);
                return parseMessage(messageResponse);
            })
        );
    }

    public async getEmail(messageId) {
        const gmail = google.gmail({ version: "v1", auth: this.oAuth2Client });
        const response = await gmail.users.messages.get({ id: messageId, userId: "me" });
        return response.data;
    }
}
