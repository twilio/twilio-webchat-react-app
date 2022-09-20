import parseMessage from "gmail-api-parse-message";
import { Credentials, OAuth2ClientOptions } from "google-auth-library";
import { google } from "googleapis";
import { OAuth2Client } from "googleapis-common";

export class GmailAPIHelper {
    oAuth2Client: OAuth2Client;

    refresh_token: string;

    constructor(oAuthClientOptions: OAuth2ClientOptions, token: Credentials) {
        this.oAuth2Client = new google.auth.OAuth2(
            oAuthClientOptions.clientId,
            oAuthClientOptions.clientSecret,
            oAuthClientOptions.redirectUri
        );
        this.refresh_token = token.refresh_token;
        this.oAuth2Client.setCredentials(token);
    }

    public async getReceivedEmails(emailCount: number) {
        console.log("HERE!");
        const gmail = google.gmail({ version: "v1", auth: this.oAuth2Client });
        console.log("HERE 2!");
        const response = await gmail.users.messages.list({ userId: "me", labelIds: ["INBOX"], maxResults: emailCount });
        console.log("HERE 3!", response);
        return Promise.all(
            response.data.messages.map(async (message) => {
                console.log("message", message);
                const messageResponse = await this.getEmail(message.id);
                console.log("messageResponse", messageResponse);
                return parseMessage(messageResponse);
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
