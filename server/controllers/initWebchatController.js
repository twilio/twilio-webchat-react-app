const axios = require("axios");
const { createToken } = require("../helpers/createToken");
const { TOKEN_TTL_IN_SECONDS } = require("../constants");
const { getTwilioClient } = require("../helpers/getTwilioClient");
const { logFinalAction, logInitialAction, logInterimAction } = require("../helpers/logs");
const { version } = require('./../../package.json');

const createConversationAndTriggerStudioFlow = async (request, customerFriendlyName) => {
    logInterimAction("Creating conversation for Studio Flow webhook triggering");
    
    const twilioClient = getTwilioClient();
    
    // 1) Create the conversation
    const conversation = await twilioClient.conversations.v1.conversations.create({
        friendlyName: `Webchat - ${customerFriendlyName}`,
        uniqueName: `webchat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });

    // 2) Attach a conversation-scoped webhook that targets Studio
    await twilioClient.conversations.v1
        .conversations(conversation.sid)
        .webhooks
        .create({
            target: 'studio',
            'configuration.flowSid': process.env.STUDIO_FLOW_SID,
            'configuration.filters': ['onMessageAdded'] // fire Studio on inbound messages
        });
    
    // Add customer participant
    const customerParticipant = await twilioClient.conversations
        .conversations(conversation.sid)
        .participants.create({
            identity: `customer-${Date.now()}`,
            attributes: JSON.stringify({
                friendlyName: customerFriendlyName,
                ...request.body?.formData
            })
        });

    // Send initial message to trigger the Studio Flow webhook
    const initialMessage = await twilioClient.conversations.v1
        .conversations(conversation.sid)
        .messages
        .create({ 
            author: 'System', 
            body: `New webchat session started by ${customerFriendlyName}`,
            attributes: JSON.stringify({
                flowTrigger: true,
                customerName: customerFriendlyName,
                customerEmail: request.body?.formData?.email || '',
                customerQuery: request.body?.formData?.query || '',
                channelType: 'webchat',
                direction: 'inbound',
                ...request.body?.formData
            }),
            xTwilioWebhookEnabled: true 
        });

    logInterimAction("Conversation created - Studio Flow will be triggered via webhook");
        
    return {
        conversationSid: conversation.sid,
        flowExecutionSid: initialMessage.sid, // Use message SID as flow execution reference
        identity: customerParticipant.identity
    };
};

const sendUserMessage = (conversationSid, identity, messageBody) => {
    logInterimAction("Sending user message");
    return getTwilioClient()
        .conversations.conversations(conversationSid)
        .messages.create({
            body: messageBody,
            author: identity,
        })
        .then(() => {
            logInterimAction("(async) User message sent");
        })
        .catch((e) => {
            logInterimAction(`(async) Couldn't send user message: ${e?.message}`);
        });
};

const sendWelcomeMessage = (conversationSid, customerFriendlyName) => {
    logInterimAction("Sending welcome message");
    return getTwilioClient()
        .conversations.conversations(conversationSid)
        .messages.create({
            body: `Welcome ${customerFriendlyName}! An agent will be with you in just a moment.`,
            author: "AnyVan"
        })
        .then(() => {
            logInterimAction("(async) Welcome message sent");
        })
        .catch((e) => {
            logInterimAction(`(async) Couldn't send welcome message: ${e?.message}`);
        });
};

const initWebchatController = async (request, response) => {
    const useStudioFlow = !!process.env.STUDIO_FLOW_SID;
    logInitialAction(`Initiating webchat with ${useStudioFlow ? 'Studio Flow' : 'TaskRouter'}`);

    const customerFriendlyName = request.body?.formData?.friendlyName || "Customer";

    let conversationSid;
    let flowExecutionSid;
    let taskSid;
    let identity;

    try {
        const result = await createConversationAndTriggerStudioFlow(request, customerFriendlyName);
        ({ conversationSid, flowExecutionSid, taskSid, identity } = result);
    } catch (error) {
        logInterimAction(`Error creating conversation/triggering flow: ${error?.message}`);
        return response.status(500).send(`Couldn't initiate WebChat: ${error?.message}`);
    }

    // Generate token for customer
    const token = createToken(identity);

    // OPTIONAL — if user query is defined
    if (request.body?.formData?.query) {
        sendUserMessage(conversationSid, identity, request.body.formData.query).then(() =>
            sendWelcomeMessage(conversationSid, customerFriendlyName)
        );
    }

    const responseData = {
        token,
        conversationSid,
        expiration: Date.now() + TOKEN_TTL_IN_SECONDS * 1000
    };

    // Add the appropriate ID based on what was created
    if (flowExecutionSid) {
        responseData.flowExecutionSid = flowExecutionSid;
    } else if (taskSid) {
        responseData.taskSid = taskSid;
    }

    response.send(responseData);

    logFinalAction(`Webchat successfully initiated with ${useStudioFlow ? 'Studio Flow' : 'TaskRouter'}`);
};

module.exports = { initWebchatController };
