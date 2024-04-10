# Adding the chat to an existing application

This guide will walk you through the process of adding the chat widget to an existing web application.

## 1. Fetch the chat script

Add the following script tag to your HTML file:

```html
<!-- for the development environment -->
<script src="https://d20pg3k5glb1vh.cloudfront.net/develop/static/js/main.js"></script>
```

```html
<!-- for production -->
<script src="https://d20pg3k5glb1vh.cloudfront.net/main/static/js/main.js"></script>
```

## 2. Declare the root element

Next, declare the root element that the webchat widget will be rendered into:

```html
<div id="twilio-webchat-widget-root"></div>
```

## 3. Initialize the chat widget

Finally, add the code to initialize the webchat widget as per following example. 

```html
<script>
   window.addEventListener("DOMContentLoaded", async () => {
      const chatDispatcher = await Twilio.initWebchat({
         serverUrl: "%TWILIO_CHAT_SERVER_URL%",
         brand: "LUUNA",
         posProfile: "Luuna MX",
      });
   });
</script>
```

1. The `Twilio` object is available after the chat script is loaded.
2. You don't need to specifically wait for the `DOMContentLoaded` event, you can use whatever event your framework provides or
   wait for the `window.Twilio` object to be available.
3. For `TWILIO_CHAT_SERVER_URL` you could use the following URL: `https://webchat-react-app-serverless-7446-dev.twil.io` but
   we suggest making it dynamic as it could change depending on the environment.
4. The `brand` and `posProfile` are mandatory and should contain the Zecore Brand and POS profile for the site.
5. The chatDispatcher object is used to interact with the chat widget and will be explained in the next section.

## :factory: ChatDispatcher class


This class is used for the interaction with the chat widget. It provides methods to open and close the chat window, show a new message, and listen to events.

### Methods

- [openChatWindow](#gear-openchatwindow)
- [closeChatWindow](#gear-closechatwindow)
- [showNewMessage](#gear-shownewmessage)
- [onShow](#gear-onshow)
- [onHide](#gear-onhide)
- [onUnreadCountChange](#gear-onunreadcountchange)

#### :gear: openChatWindow

Expands the chat window

| Method | Type |
| ---------- | ---------- |
| `openChatWindow` | `() => void` |

#### :gear: closeChatWindow

Closes the chat window

| Method | Type |
| ---------- | ---------- |
| `closeChatWindow` | `() => void` |

#### :gear: showNewMessage

Opens the chat window and prefills the message input with the provided message.

| Method | Type |
| ---------- | ---------- |
| `showNewMessage` | `(message: string) => void` |

Parameters:

* `message`: - The message to prefill the message input with


#### :gear: onShow

The callback is called when the chat window is shown.

| Method | Type |
| ---------- | ---------- |
| `onShow` | `(callback: () => void) => void` |

Parameters:

* `callback`: - The callback to be called when the chat window is shown. It does not receive any arguments.


#### :gear: onHide

The callback is called when the chat window is hidden.

| Method | Type |
| ---------- | ---------- |
| `onHide` | `(callback: () => void) => void` |

Parameters:

* `callback`: - The callback to be called when the chat window is hidden. It does not receive any arguments.


#### :gear: onUnreadCountChange

Whenever the amount of unread messages changes, the callback is called with the new count.

| Method | Type |
| ---------- | ---------- |
| `onUnreadCountChange` | `(callback: (newCount: number) => void) => void` |

Parameters:

* `callback`: - The callback to be called when the amount of unread messages changes. It receives the new count as an argument.


