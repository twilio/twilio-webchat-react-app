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
        const gmail = google.gmail({ version: "v1", auth: this.oAuth2Client });
        const response = await gmail.users.messages.list({ userId: "me", labelIds: ["INBOX"], maxResults: emailCount });
        return Promise.all(
            response.data.messages.map(async (message) => {
                return this.getEmail(message.id);
            })
        );
    }

    public async getEmail(messageId) {
        const gmail = google.gmail({ version: "v1", auth: this.oAuth2Client });
        const response = await gmail.users.messages.get({ id: messageId, userId: "me" });
        return response.data;
    }
}
