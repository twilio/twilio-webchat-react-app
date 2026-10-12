# Twilio Webchat React App

_The Twilio Webchat React app_ is an open-source project built with Twilio's Conversations JS SDK, the Twilio Paste design library, and the Create React app. It provides an example of how to build a basic webchat widget, integrate it with the Flex platform, and use it as a communication channel between your website visitors and your Flex-powered contact center.

Before deciding to use the Webchat React app, we recommend reviewing [Webchat 3.x.x](https://www.twilio.com/docs/flex/developer/conversations/webchat), our out-of-the-box webchat solution for Flex that features enhanced security capabilities. Webchat 3.x.x meets most customers’ standard webchat needs.

If Webchat 3.x.x’s out-of-the-box functionality doesn't fully meet your requirements and you need extensive customization, consider building with the Webchat React app. However, note that Twilio does not provide support for your implementation of the Webchat React app. 

---

1. [Getting started](#Getting-started)
    1. [Setup](#Setup)
    2. [Work locally](#Work-locally)
2. [Breaking changes](#breaking-changes)
3. [Features](#Features)
4. [Project structure](#Project-structure)
    1. [React App](#1-react-app)
    2. [Local backend server](#2-local-backend-server)
5. [Working in production](#working-in-production)
6. [Browser support](#Browser-support)
7. [Accessibility](#Accessibility)
8. [Security](#Security)
9. [FAQs](#faqs)

---

# Getting Started

## Setup

### 1. Install Dependencies

Run the following command

```shell
yarn
```

### 2. Populate Your .env File

We provide a handy `bootstrap` script to set up the environment variables required, but you can alternatively copy the `.env.sample` file.

```shell
yarn bootstrap \
accountSid=YOUR_ACCOUNT_SID \
authToken=YOUR_AUTH_TOKEN \
apiKey=YOUR_API_KEY_SID \
apiSecret=YOUR_API_SECRET \
addressSid=YOUR_ADDRESS_SID \
conversationsServiceSid=YOUR_CONVERSATIONS_SERVICE_SID
```

You can find your **Account Sid** and **Auth Token** on the main [Twilio Console page](https://console.twilio.com/).

For more info on how to create an **API key** and an **API secret**, please check the [documentation](https://www.twilio.com/docs/glossary/what-is-an-api-key#how-can-i-create-api-keys).

You can find your **Conversations Service Sid** on the [services page](https://console.twilio.com/us1/develop/conversations/manage/services?frameUrl=%2Fconsole%2Fconversations%2Fservices%3Fx-target-region%3Dus1). Make sure to pick the one linked to your Flex Account — usually it is named `Flex Chat Service` and it starts with `IS`

For the Address Sid, click on the edit button of your address and the edit screen will contain Address Sid. Note this Sid starts with `IG`.

The environment variables associated with enabling and configuring customer transcripts can be found in the `.env.sample` file and their use will be covered [here](#chat-transcripts).

## Working Locally

### 1. Start the Local Backend Server

```shell
yarn server
```

Your server will be served at http://localhost:3001/.

### 2. Start the Local React App Server

```shell
yarn start
```

Your app will be served at http://localhost:3000/.

# Breaking Changes

## Email transcripts are now built by the server

**Who is affected:** anyone who has email transcripts enabled (`EMAIL_TRANSCRIPT_ENABLED=true`), and especially anyone running a forked or custom backend based on the previous `/email` endpoint. Update your implementation as described below.

### Why this changed

Previously, the browser built the transcript, collected a temporary URL for every attachment, and posted all of it to `/email`. The server then downloaded every URL it was given and emailed the result to the address it was given. Because `/email` is reachable by anyone who can satisfy the origin check, this design exposed the following risks:

- **Server-Side Request Forgery (SSRF):** an attacker could send any URL as an "attachment" and make your server fetch it from inside your network: internal services, admin panels, databases with HTTP interfaces, or cloud metadata endpoints such as `http://169.254.169.254/` that can leak credentials. The response was then emailed to the attacker as an attachment.
- **Denylist bypasses:** blocking "private" IPs is not enough. Addresses such as `https://[::ffff:127.0.0.1]/`, `https://[::]/`, `fd00::/8`, decimal or hex IPv4 forms, and DNS rebinding (a hostname that resolves to a public IP at check time and a private IP at fetch time) all reach internal hosts.
- **Open mail relay:** the recipient address and email body came from the client, so `/email` could be used to send arbitrary content from your verified SendGrid sender to any address, harming your domain reputation and enabling phishing.
- **HTML injection:** message text was placed into the email HTML unescaped, so chat content could inject markup into the email.

### What changed

- `/email` now accepts **only** these fields. Anything else (including the old `text`, `mediaInfo` and `uniqueFilenames`) is ignored:

    ```json
    {
        "type": "transcript",
        "conversationSid": "CHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "recipientAddress": "customer@example.com",
        "subject": "Transcript of your chat"
    }
    ```

- The server reads the messages, authors and attachments of the conversation directly from Twilio. Attachments are downloaded from the Media Content Service by Media SID. No URL or file content is ever accepted from the client.
- `recipientAddress` must match the email in the conversation's pre-engagement data (`attributes.pre_engagement_data.email`, case-insensitive), otherwise the request is rejected with `403`. Transcripts can only be sent to the customer of that conversation.
- Message text and names are HTML-escaped in the email body.
- The `transcript.emailContent` configuration option is no longer used. The email body is generated by the server. `transcript.emailSubject` still works.
- Dates and times in the email use the server's timezone and locale instead of the customer's browser.
- If any attachment cannot be downloaded, the request fails instead of sending an email with missing files.
- `server/helpers/urlValidator.js` has been removed.

### How to update

1. **If you run your own backend**, make sure `/email` (or your equivalent) no longer downloads URLs sent by the client. Fetch the conversation's messages and media from Twilio on the server instead, as `server/helpers/email.js` does. Validating or denylisting URLs is not a sufficient fix.
2. **Update the client request** to send only `type`, `conversationSid`, `recipientAddress` and `subject`, as `src/components/Transcript.tsx` does.
3. **Deploy the client and server together.** An old client calling the new server is rejected with `400 Invalid type`; a new client calling an old server sends no attachments or body.
4. **If you customised `transcript.emailContent`**, move that customisation to `generateEmailContent` in `server/helpers/transcript.js`. Escape any customer-provided values you add to the HTML.
5. Make sure the server has `API_KEY` and `API_SECRET` set; they are now used to download attachments.

See [Email Transcript Endpoint Protection](#email-transcript-endpoint-protection) for the full list of security controls.

# Features

## Core Messaging Features

Twilio Webchat React App is built entirely with Twilio Conversations SDK and provides UI for most of its features:

-   Typing indicator
-   Read receipt
-   Attachments
-   Unread messages

This app also makes use of the v2 WebChats endpoint which creates a Conversation, an anonymous user, and configures the conversation as per the Address Sid.

## Ability to Resume Sessions

Twilio Webchat React App will persist user session, if the user closes and reopens the tab. The customer will achieve it by potentially storing the JWT token in their user's local storage. This JWT token will expire after an amount of time.

## Connectivity Notification

Twilio Webchat React App monitors user internet connectivity and will inform them with a notification if their connection has been lost.
Once the connection has been re-established,
the user again will be informed and the list of messages will be updated with any missed messages during the connectivity loss.

This feature is built using [Conversations SDK ConnectionState](http://media.twiliocdn.com/sdk/js/conversations/releases/2.0.0/docs/modules.html#ConnectionState) events and [Twilio Paste alert component](https://paste.twilio.design/components/alert).

See how to re-use Paste alert component to build custom notifications in our [How to guides](https://docs.google.com/document/d/1RWuvvZZWdV3AbuZNIC_IFyOxJaKFagdk3k-FT2VMyEM/edit#heading=h.467mbzcgq98p).

## Pre-engagement Form

Twilio Webchat React App comes out-of-the-box with a pre-engagement form. The data gathered on submission will be passed by default to the `initWebchat` endpoint of your server.
More info [here](#a-note-about-the-pre-engagement-form-data).

## Chat Transcripts

Twilio Webchat React App can provide customers with chat transcripts, if enabled. Chat transcripts can be provided to a customer through a direct download or email, at the end of a chat session. All files attached within the chat will be also be provided if a transcript is requested. This feature is disabled by default, but can be enabled by following the steps below.

### Downloading Transcripts

Customers can download chat transcripts as a plain text file. If attachments are present within the chat conversation, a zip file containing the plain text transcript file and the attached files will be downloaded.

**Setup**

Allowing customers to download transcripts requires no additional setup beyond adding the below entry to the `.env` file.

```
DOWNLOAD_TRANSCRIPT_ENABLED=true
```

### Emailing Transcripts

Customers can email chat transcripts to the email address provided in the pre-engagement form. The transcript will be provided within the body of the email and any associated files will be added as attachments to the email. Emails will be sent using the [SendGrid](https://sendgrid.com/) API.

The transcript is built entirely by the backend server. The UI only sends the conversation SID; the server reads the messages, participants and attachments of that conversation directly from Twilio (attachments are downloaded from the Media Content Service by Media SID) and composes the email itself.

**Setup**

1. Add the following entry to the `.env` file.
    ```
    EMAIL_TRANSCRIPT_ENABLED=true
    ```
2. Create a [SendGrid](https://sendgrid.com/) account with a verified domain or email. This will be used to send the email transcripts to customers.
3. Add the SendGrid API key and verified email to the `.env` file as the values for `SENDGRID_API_KEY` and `FROM_EMAIL` respectively.

The email subject can be customised in the configuration object, as described [here](#configuration).

### Disabling Email Transcripts (Emergency Kill Switch)

To disable the email transcript endpoint entirely (e.g., for security or maintenance), set:

```
EMAIL_TRANSCRIPT_DISABLED=true
```

When set, the `/email` endpoint will not be registered and will return 404. By default, the endpoint is enabled.

**Customisation**

The email subject can be customised using the configuration object, as described [here](#configuration). The HTML email content is generated by the server (`server/helpers/transcript.js`).

# Project Structure

Twilio Webchat React App is an open source repository that includes:

1. A React App
2. A local backend server

## 1. React App

The **React app** is a newer version of the legacy [webchat widget](https://www.twilio.com/docs/flex/developer/messaging/webchat/setup). With this new app, you can clone and customize it to meet your needs.
This App is built in React using Typescript, Twilio Paste and Twilio Conversations SDK.
You can find the source files in the `src` folder.

After being initialized, the widget renders a button in the bottom right part of the page that, once clicked, will show a customisable form for your customers to compile.
Once submitted, the App will hit the `initWebchat` endpoint of your server with the form data and get back a token with a conversationSid.
At that point, your customer will be able to send messages to your agents.

### Configuration

This React app is open-sourced, so you can freely customise every aspect of it to suit your needs. However, to speed up some aspects of the customisations, we are exposing a configuration object on the init function.

Here's an example of how to use this config object in your `index.html` template.

```javascript
window.addEventListener("DOMContentLoaded", () => {
    Twilio.initWebchat({
        serverUrl: "%YOUR_SERVER_URL%",
        theme: {
            isLight: true,
            overrides: {
                backgroundColors: {
                    colorBackgroundBody: "#faebd7"
                    // .. other Paste tokens
                }
            }
        },
        fileAttachment: {
            enabled: true,
            maxFileSize: 16777216, // 16 MB
            acceptedExtensions: ["jpg", "jpeg", "png", "amr", "mp3", "mp4", "pdf"]
        },
        transcript: {
            emailSubject: (agentNames) => {
                let subject = "Transcript of your chat";
                if (agentNames.length > 0) {
                    subject = subject.concat(` with ${agentNames[0]}`);
                    agentNames.slice(1).forEach((name) => (subject = subject.concat(` and ${name}`)));
                }
                return subject;
            }
        }
    });
});
```

1. `serverUrl` represents the base server url that the app will hit to initialise the session or refresh the token.
2. `theme` can be used to quickly customise the look and feel of the app.
    1. `theme.isLight` is a boolean to quickly toggle between the light and dark theme of Paste.
    2. `theme.overrides` is an object that you can fill with all the theme tokens you want to customise. Here's the full [list of tokens](https://paste.twilio.design/tokens/). **Note** remember to change the keys from `kebab-case` to `camelCase`.
3. `fileAttachment` allows you to enable and configure what files your customers can send to your agents.
    1. `fileAttachment.enabled` describes whether customers can send agents any file at all.
    2. `fileAttachment.maxSize` describes the max file size that customers can send (in bytes).
    3. `fileAttachment.acceptedExtensions` is an array describing the file types that customers can send.
4. `transcript` allows you to enable and configure what chat transcripts your customers can received.
    1. `transcript.emailSubject` configures what email customers receive in the email subject when they request an emailed transcript.
    2. `transcript.emailContent` is no longer used. The email body is generated by the server; to change it, edit `generateEmailContent` in `server/helpers/transcript.js`.

## 2. Local Backend Server

As mentioned before, Twilio Webchat App requires a backend to hit in order to work correctly.
This server — found in the `server` folder — exposes two main controllers.

### 1. InitWebchat

This first controller, hit by the application when the pre-engagement form is submitted, takes care of a few things:

1. Contacts Twilio Webchats endpoint to create a conversation and get a `conversationSid` and a participant `identity`
2. Creates a token with the correct grants for the provided participant identity
3. (optional) Programmatically send a message in behalf of the user with their query and then a welcome message

#### A note about the pre-engagement form data

By default, this endpoint takes the `friendlyName` field of the form and uses it to set the customer User's name via the webchat orchestration endpoint.

In addition to that, all the fields (including `friendlyName`) will be saved as the conversation `attributes`, under the `pre_engagement_data` key. You can find additional information on the Conversation object [here](https://www.twilio.com/docs/conversations/api/conversation-resource#conversation-properties).

### 2. RefreshToken

This second controller is in charge of refreshing a token that is about to expire. If the token is invalid or already expired, it will fail.

# Working in Production

In order to use this widget in production you will need to follow these three steps:

1. Create remote server endpoints.
2. Upload compiled and minimised React App code.
3. Update your website template.

## 1. Create Remote Server Endpoints

It is necessary to create two endpoints on a remote server or as serverless functions, for [initWebchat](#1-initwebchat) and [refreshToken](#2-refreshtoken) logic.

### Security Best Practises

We highly recommend that you implement as many of the following security controls as possible, in order to have a more secure backend.

1. **Create an allow-list on the server side.** It is necessary to verify on the server side that all the requests are sent from an allowed domain (by checking the origin header).
2. **Configure the Access-Control-Allow-Origin header** using the allow-list described above. This will prevent browsers from sending requests from malicious websites.
3. **Create logs to detect and find anomalous behaviors.**
4. **Block requests by IP, by geolocation/country and by URL**. Thanks to the logs created, it is possible to detect suspicious behaviours, depending on those behaviours it is possible to block requests for specific IP addresses, domains and even geolocations.
5. **Include a fingerprint in the token.** Generate a fingerprint to try to identify the client and include it in the token. When the token is sent, the fingerprint is generated again and compared with the token's fingerprint.

## 2. Upload Compiled and Minimised React App Code

To create a bundle file for the whole Webchat React App.

```shell
yarn build
```

Make sure to upload and host this file on your server, or on a host service, that is accessible from your website's domain.

## 3. Update Your Website Template

Once the bundle is uploaded, make sure to have it loaded in your website page, as per example below:

```html
<script src="https://[...]webchat.js"></script>
```

Next, declare the root element that the webchat widget will be rendered into:

```html
<div id="twilio-webchat-widget-root"></div>
```

Finally, add the code to initialize the webchat widget as per following example. It is crucial that you update the `serverUrl` with the base URL of your endpoints.
The React App will then target `/initWebchat` and `/refreshToken` endpoints. If you want to use different endpoint urls, make sure to upload the code in `src/sessionDataHandler.ts`.

For more information about the available options, please check the [Configuration section](#configuration).

```html
<script>
    window.addEventListener("DOMContentLoaded", () => {
        Twilio.initWebchat({
            serverUrl: "%SERVER_URL%" // IMPORTANT, UPDATE THIS!!
        });
    });
</script>
```

# Browser Support

Twilio Webchat React App is built entirely on two main libraries Twilio Paste Design System and Twilio Conversations SDK, and it supports the same set up browsers.
For more information please refer to [Twilio Conversations SDK browser support](http://media.twiliocdn.com/sdk/js/conversations/releases/2.0.1/docs/#changelog) and [Twilio Paste browser support FAQ](https://paste.twilio.design/getting-started/faqs/#engineering)

# Accessibility

Twilio Webchat React App is built using [Twilio Paste Design System](https://paste.twilio.design/) and follows accessibility standards.
Using Webchat app as a foundation for your website chat widget will make it easier to stay WCAG compliant with your website.
Find out more about [Twilio UX principles](https://paste.twilio.design/principles) and [inclusive design guidelines](https://paste.twilio.design/inclusive-design).

# Security

## Email Transcript Endpoint Protection

The `/email` endpoint never receives URLs or file content from the client, so it cannot be used for Server-Side Request Forgery (SSRF).

### Accepted Inputs

The `/email` endpoint accepts only the following fields. Any other field sent in the request body is ignored.

| Field              | Description                                                                 |
| ------------------ | --------------------------------------------------------------------------- |
| `type`             | Must be `"transcript"`                                                      |
| `conversationSid`  | Conversation SID (`CH` followed by 32 hex characters)                       |
| `recipientAddress` | Email address to send the transcript to                                     |
| `subject`          | Email subject                                                               |

### Recipient Validation
The server fetches the conversation and compares `recipientAddress` (case-insensitive) with the email stored in the conversation's pre-engagement data (`attributes.pre_engagement_data.email`). The request is rejected with `403` if they do not match or if no email is stored, so transcripts can only be sent to the customer of that conversation.

### Server-side Transcript and Attachments
- Messages and authors are read from the Twilio Conversations API using the server's credentials
- Attachments are fetched from the Media Content Service (`https://mcs.us1.twilio.com/v1/Services/{ChatServiceSid}/Media/{MediaSid}`) by Media SID, using `API_KEY`/`API_SECRET`; the server then downloads the temporary link returned by Twilio
- Message text and names are HTML-escaped before being placed in the email body

### Request Limits
- **Timeout**: 30 second request timeout per media request
- **Size Limit**: 25MB maximum content size per file

### Emergency Disable

To completely disable the email transcript endpoint, set:

```
EMAIL_TRANSCRIPT_DISABLED=true
```

This will prevent the `/email` route from being registered on the server.

# FAQs

### As a developer, how do I clear an ongoing chat?

Open your browser console, run `localStorage.clear()` and refresh the page to start anew.
Alternatively, you can simply wrap up/complete the corresponding task as an agent from your Flex UI instance.

### Can I use npm?

Currently there is a known issue with installing dependencies for this project using npm. We are investigating this and will publish a fix as soon as possible. We recommend using `yarn` instead.

# License

MIT © Twilio Inc.
