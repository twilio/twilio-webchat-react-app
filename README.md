
# Twilio Webchat React App


_Twilio Webchat React App_ is an application that demonstrates a website chat widget built for Flex Conversations. It uses Twilio's Conversations JS SDK, Twilio Paste Design library, the Flex WebChats endpoint, and the Create React App.

---

1. [Getting started](#Getting-started)
   1. [Setup](#Setup)
   2. [Work locally](#Work-locally)
2. [Features](#Features)
3. [Project structure](#Project-structure)
   1. [React App](#1-react-app)
   2. [Local backend server](#2-local-backend-server)
4. [Working in production](#working-in-production)
5. [Browser support](#Browser-support)
6. [Accessibility](#Accessibility)
7. [FAQs](#faqs)

---

# Getting Started

## Setup

### 1. Install Dependencies

Run the following command

```shell
yarn

# or with npm
npm install
```

### 2. Populate Your .env File

We provide a handy `bootstrap` script to set up the environment variables, but you can alternatively copy the `.env.sample` file.

```shell
yarn bootstrap \
accountSid=YOUR_ACCOUNT_SID \
authToken=YOUR_AUTH_TOKEN \
apiKey=YOUR_API_KEY_SID \
apiSecret=YOUR_API_SECRET \
addressSid=YOUR_ADDRESS_SID \
conversationsServiceSid=YOUR_CONVERSATIONS_SERVICE_SID

# or with npm
npm run bootstrap \
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

## Working Locally

### 1. Start the Local Backend Server
```shell
yarn server

# or with npm
npm run server
```
Your server will be served at http://localhost:3001/.


### 2. Start the Local React App Server

```shell
yarn start

# or with npm
npm run start
```

Your app will be served at http://localhost:3000/.


# Features

## Core Messaging Features 
Twilio Webchat React App is built entirely with Twilio Conversations SDK and provides UI for most of its features:
- Typing indicator
- Read receipt
- Attachments
- Unread messages

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
               colorBackgroundBody: "#faebd7",
               // .. other Paste tokens
            }
         }
      },
      fileAttachment: {
         enabled: true,
         maxFileSize: 16777216, // 16 MB
         acceptedExtensions: ["jpg", "jpeg", "png", "amr", "mp3", "mp4", "pdf"]
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
1. **Create an allow-list on the server side.**  It is necessary to verify on the server side that all the requests are sent from an allowed domain (by checking the origin header).
2. **Configure the Access-Control-Allow-Origin header** using the allow-list described above. This will prevent browsers from sending requests from malicious websites. 
3. **Create logs to detect and find anomalous behaviors.**
4. **Block requests by IP, by geolocation/country and by URL**. Thanks to the logs created, it is possible to detect suspicious behaviours, depending on those behaviours it is possible to block requests for specific IP addresses, domains and even geolocations.
5. **Include a fingerprint in the token.** Generate a fingerprint to try to identify the client and include it in the token. When the token is sent, the fingerprint is generated again and compared with the token's fingerprint.

## 2. Upload Compiled and Minimised React App Code
To create a bundle file for the whole Webchat React App.
```shell
yarn build

# or with npm
npm run build
```

Make sure to upload and host this file on your server, or on a host service, that is accessible from your website's domain. 

## 3. Update Your Website Template

Once the bundle is uploaded, make sure to have it loaded in your website page, as per example below:

```html
<script src="https://[...]webchat.js"></script>
```

Finally, add the code to initialize the webchat widget as per following example. It is crucial that you update the `serverUrl` with the base URL of your endpoints.
The React App will then target `/initWebchat` and `/refreshToken` endpoints. If you want to use different endpoint urls, make sure to upload the code in `src/sessionDataHandler.ts`.

For more information about the available options, please check the [Configuration section](#configuration).
```html
<script>
     window.addEventListener("DOMContentLoaded", () => {
         Twilio.initWebchat({
             serverUrl: "%SERVER_URL%" // IMPORTANT, UPDATE THIS!!
         })
     })
</script>
```

# Browser Support
Twilio Webchat React App is built entirely on two main libraries Twilio Paste Design System and Twilio Conversations SDK, and it supports the same set up browsers.
For more information please refer to [Twilio Conversations SDK browser support](http://media.twiliocdn.com/sdk/js/conversations/releases/2.0.1/docs/#changelog) and [Twilio Paste browser support FAQ](https://paste.twilio.design/getting-started/faqs/#engineering)


# Accessibility

Twilio Webchat React App is built using [Twilio Paste Design System](https://paste.twilio.design/) and follows accessibility standards.
Using Webchat app as a foundation for your website chat widget will make it easier to stay WCAG compliant with your website.
Find out more about [Twilio UX principles](https://paste.twilio.design/principles) and [inclusive design guidelines](https://paste.twilio.design/inclusive-design).


# FAQs

### As a developer, how do I clear an ongoing chat?

Open your browser console, run `localStorage.clear()` and refresh the page to start anew.
Alternatively, you can simply wrap up/complete the corresponding task as an agent from your Flex UI instance.

# License

MIT © Twilio Inc.
