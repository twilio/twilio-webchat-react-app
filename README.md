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
REACT_APP_DEPLOYMENT_KEY=YOUR_REACT_APP_DEPLOYMENT_KEY
REACT_APP_REGION=YOUR_REACT_APP_REGION
```

You can find your **Account Sid** and **Auth Token** on the main [Twilio Console page](https://console.twilio.com/).

For more info on how to create an **API key** and an **API secret**, please check the [documentation](https://www.twilio.com/docs/glossary/what-is-an-api-key#how-can-i-create-api-keys).

You can find your **Conversations Service Sid** on the [services page](https://console.twilio.com/us1/develop/conversations/manage/services?frameUrl=%2Fconsole%2Fconversations%2Fservices%3Fx-target-region%3Dus1). Make sure to pick the one linked to your Flex Account — usually it is named `Flex Chat Service` and it starts with `IS`

For the Address Sid, click on the edit button of your address and the edit screen will contain Address Sid. Note this Sid starts with `IG`.

The environment variables associated with **deploymentKey** and **region** can be found in the `.env.sample` file. These values can also be part of queryParams. If present in both, precedence will be given to queryParams.

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

# Project Structure

Twilio Webchat React App is an open source repository that includes:

1. A React App

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
        deploymentKey: urlParams.get("deploymentKey") || "%REACT_APP_DEPLOYMENT_KEY%",
        region: urlParams.get("region") || "%REACT_APP_REGION%",
        theme: {
            isLight: true
        }
    });
});
```

1. `theme` can be used to quickly customise the look and feel of the app.
    1. `theme.isLight` is a boolean to quickly toggle between the light and dark theme of Paste.
2. `deploymentKey` is a UUID with a fixed length. An AccountSid has one-to-many relationship with deploymentKey. Customers are to use this deploymentKey to initiate Webchat UI.
3. `region` for the host (i.e stage-us1, dev-us1, us1), defaults to us1(prod)

#### A note about the pre-engagement form data

By default, this endpoint takes the `friendlyName` field of the form and uses it to set the customer User's name via the webchat orchestration endpoint.

# Working in Production

In order to use this widget in production you will need to follow these two steps:

1. Either you can directly work with our CDN urls or upload compiled and minimised React App code.
2. Update your website template.

## 1. Work With Our CDN Urls Or Upload Compiled And Minimised React App Code

We have CDN urls in place that you can directly integrate in your application to make the widget work. You can point to a specific version of the webchat or  else point to latest. 

```shell
CDN url to point to a specific version:

https://media.twiliocdn.com/sdk/js/webchat-v3/releases/<VERSION_NUMBER>/webchat.min.js

or

CDN url to point to the latest version

https://media.twiliocdn.com/sdk/js/webchat-v3/releases/latest/webchat.min.js
```
If you wish to not work with the above CDNs, then you need to create a bundle file for the whole Webchat React App via.

```shell
yarn build
```

And then, make sure to upload and host this file on your server, or on a host service, that is accessible from your website's domain.

## 2. Update Your Website Template

Based on your choice in the previous step, make sure to have it loaded in your website page, as per example below:

```html
<script src="https://[...]webchat.js"></script>
```

Next, declare the root element that the webchat widget will be rendered into:

```html
<div id="twilio-webchat-widget-root"></div>
```

Finally, add the code to initialize the webchat widget as per following example.
The React App will then target `/initWebchat` and `/refreshToken` endpoints. If you want to use different endpoint urls, make sure to upload the code in `src/sessionDataHandler.ts`.

For more information about the available options, please check the [Configuration section](#configuration).

```html
<script>
    window.addEventListener("DOMContentLoaded", () => {
        Twilio.initWebchat({
            deploymentKey: urlParams.get("deploymentKey") || "%REACT_APP_DEPLOYMENT_KEY%",
            region: urlParams.get("region") || "%REACT_APP_REGION%",
            theme: {
                isLight: true
            }
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

# FAQs

### As a developer, how do I clear an ongoing chat?

Open your browser console, run `localStorage.clear()` and refresh the page to start anew.
Alternatively, you can simply wrap up/complete the corresponding task as an agent from your Flex UI instance.

### Can I use npm?

Currently there is a known issue with installing dependencies for this project using npm. We are investigating this and will publish a fix as soon as possible. We recommend using `yarn` instead.

# License

MIT © Twilio Inc.
