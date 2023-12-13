# Twilio Webchat React App

_Twilio Webchat React App_ is an application that demonstrates a website chat widget built for Flex Conversations. It uses Twilio's Conversations JS SDK, Twilio Paste Design library, the Flex WebChats endpoint, and the Create React App.

---

1. [Getting started](#Getting-started)
    1. [Setup](#Setup)
    2. [Working locally](#Working-locally)
2. [Features](#Features)
3. [Project structure](#Project-structure)
    1. [React App](#1-react-app)
4. [Working in production](#working-in-production)
5. [Browser support](#Browser-support)
6. [Accessibility](#Accessibility)
7. [FAQs](#faqs)
8. [License](#license)

---

# Getting Started

## Setup

### 1. Install Dependencies

Run the following command

```shell
yarn
```

## Working Locally

### 1. Start the Local React App Server

```shell
yarn start
```

Your app will be served at http://localhost:3000/. 


### 2. Work with out-of-the-box customisations

Your application now supports query params, so that you can customise.
1. `deploymentKey` For more info on **Deployment Key** refer to [configuration](#configuration)
2. `appStatus` Used to toggle the widget state. For more info, refer to [Configuration section](#configuration).
3. `theme`: Decide if `light` or `dark` suits you and provide that value as here. Application will boot with the said theme. For more info, refer to [Configuration section](#configuration).

Below is an example where you've provide all of the query params:
[http://localhost:3000/?deploymentKey=CV00000&appStatus=open&theme=light](http://localhost:3000/?deploymentKey=CV00000&appStatus=open&theme=light)

We are working towards exposing more values that allows customisation at minimal steps. However, if you want to customise beyond, please feel free to make changes to your code and then, make sure to upload and host this file on your server, or on a host service, that is accessible from your website's domain.


### 3. Test your changes.

We provide a handy `bootstrap` script to set up the environment variables required, but you can alternatively copy the `.env.sample` file.

```shell
yarn bootstrap \
accountSid=YOUR_ACCOUNT_SID \
authToken=YOUR_AUTH_TOKEN \
apiKey=YOUR_API_KEY_SID \
apiSecret=YOUR_API_SECRET \
deploymentKey=DEPLOYMENT_KEY \
```

You can find your **Account Sid** and **Auth Token** on the main [Twilio Console page](https://console.twilio.com/).

For more info on how to create an **API key** and an **API secret**, please check the [documentation](https://www.twilio.com/docs/glossary/what-is-an-api-key#how-can-i-create-api-keys).

The environment variables associated with **deploymentKey** can be found in the `.env.sample` file. You can find more details about them in [Configuration section](#configuration)

Once all the values populated, run `yarn cypress open` to kickstart end-to-end test.

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

The **React app** is a newer version of the legacy [webchat widget](https://www.twilio.com/docs/flex/developer/messaging/webchat/setup). We have enhanced security and revamped accessibility with this release. More infromation on this release can be found on [this documentation here](https://www.twilio.com/docs/flex/developer/conversations/webchat). This App is built in React using Typescript, Twilio Paste and Twilio Conversations SDK.
You can find the source files in the `src` folder.

After being initialized, the widget renders a button in the bottom right part of the page that, once clicked, will show a customisable form for your customers to compile. Once submitted, the App will hit the twilio backend  server with the form data and get back a token with a conversationSid. At that point, your customer will be able to send messages to your agents.

### Configuration

This React app is open-sourced, so you can freely customise every aspect of it to suit your needs. However, to speed up some aspects of the customisations, we are exposing a configuration object on the init function. In order to use the below mentioned values, you first need to configure your Webchat Instance. For more information on how to setup refer [here](https://www.twilio.com/docs/flex/developer/conversations/webchat/setup)


Here's an example of how to use this config object in your `index.html` template.

```javascript
window.addEventListener("load", () => {
    Twilio.initWebchat({
        deploymentKey: "CVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        appStatus: "open",
        theme: {
            isLight: true
        }
    });
});
```

1. `deploymentKey` is a UUID with a fixed length. As a security enhancement, we have encapsulated **AccountSid** with **DeploymentKey**. An **AccountSid** has one-to-many relationship with **DeploymentKey**. This means, **AccountSid** is not any public entity anymore for webchat. Customers are to use **DeploymentKey** to initiate Webchat UI. For more info on how to create a **Deployment Key** refer to [this section](https://www.twilio.com/docs/flex/developer/conversations/webchat/security#deployment-key-shields-your-account-information)
2. `appStatus` is used to keep the widget opened or closed. We find this helpful where you want to customise to keep the widget open. To keep it open, set value to 'open'. Don't pass this value to keep the widget 'closed'. For more information refer to [this section](https://www.twilio.com/docs/flex/developer/conversations/webchat/setup#customize-webchat)
3. `theme` can be used to quickly customise the look and feel of the app. `theme.isLight` is a boolean to quickly toggle between the light and dark theme of Paste. For more information refer to [this section]([this section](https://www.twilio.com/docs/flex/developer/conversations/webchat/setup#customize-webchat)


#### A note about the pre-engagement form data

By default, pre-engagement form takes the `friendlyName` field of the form and uses it to set the customer User's name via the webchat orchestration endpoint.

Kindly note that pre-engagement data is considered to be PII. For more information about PII and how we handle, you can read [here](https://www.twilio.com/docs/glossary/what-is-personally-identifiable-information-pii#pii-fields).

# Working in Production

In order to use this widget in production you will need to follow these two steps:

1. Either you can directly work with our CDN urls or upload compiled and minimised React App code.
2. Setup your Webchat and Update your website template. 

## 1. Work With Our CDN Urls Or Upload Compiled And Minimised React App Code

We have CDN urls in place that you can directly integrate in your application to make the widget work. You can point to a specific [version](#release-versioning) of webchat release or else point to latest.


CDN url to point to a specific version:
```shell
https://media.twiliocdn.com/sdk/js/webchat-v3/releases/<VERSION_NUMBER>/webchat.min.js
```

For example:
CDN url to point to 1.0.0 version:

```shell
https://media.twiliocdn.com/sdk/js/webchat-v3/releases/1.0.0/webchat.min.js
```

or CDN url to point to the latest version

```shell
https://media.twiliocdn.com/sdk/js/webchat-v3/releases/latest/webchat.min.js
```

If you wish to not work with the above CDNs, then you need to create a bundle file for the Webchat React App via.

```shell
yarn build
```

And then, make sure to upload and host this file on your server, or on a host service, that is accessible from your website's domain.

## 2. Update Your Website Template

Based on your choice in the previous step, make sure to have it loaded in your website page, as per example below:

```html
<script src="https://[...]webchat.min.js"></script>
```

Next, declare the root element that the webchat widget will be rendered into:

```html
<div id="twilio-webchat-widget-root"></div>
```

Finally, add the code to initialize the webchat widget as per as shown in [Configuration section](#configuration).

# Release Versioning

## Semantic Versioning

We use semantic versioning for releases. Check out https://semver.org/

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
