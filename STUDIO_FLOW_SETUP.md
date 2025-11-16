# Studio Flow Integration Setup

This webchat widget now triggers a Twilio Studio Flow instead of creating TaskRouter tasks directly.

## Required Environment Variables

Add these variables to your `.env` file:

```env
# Studio Flow Configuration
STUDIO_FLOW_SID=FWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Conversations Service (already configured)
CONVERSATIONS_SERVICE_SID=ISxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Keep TaskRouter config for fallback or Studio Flow integration
TASKROUTER_WORKSPACE_SID=WSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TASKROUTER_WORKFLOW_SID=WWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Setup Steps

### 1. Create a Studio Flow
1. Go to Twilio Console → Studio → Flows
2. Create a new flow or use an existing one
3. Copy the Flow SID (starts with `FW`)

### 2. Configure Flow Parameters
Your Studio Flow will receive these parameters:
- `conversationSid`: The Twilio Conversations SID
- `customerName`: Customer's friendly name
- `customerEmail`: Customer's email address
- `customerQuery`: Customer's initial query
- `channelType`: Set to 'webchat'
- `direction`: Set to 'inbound'
- Any additional form data from the pre-engagement form

### 3. Flow Design Options

#### Option A: Direct to Flex
- Use a "Connect to Flex" widget in your Studio Flow
- Pass the conversation SID and other parameters to Flex
- Flex will create the TaskRouter task automatically

#### Option B: Custom Logic Before Flex
- Add widgets for form validation, routing logic, or business rules
- Use "Connect to Flex" as the final step
- You can add delays, conditional routing, or automated responses

#### Option C: No Flex Integration
- Handle the entire conversation in Studio Flow
- Use "Send to Flex" widget only when human agent is needed

### 4. Example Flow Structure
```
Trigger → Set Variables → [Optional Logic] → Connect to Flex → End
```

### 5. Flow Trigger Configuration
- **Trigger Type**: Webhook or REST API
- **To**: Will be set to the conversation SID automatically
- **From**: Will be set to your Conversations Service SID automatically
- **Parameters**: All form data and conversation details

## Benefits

✅ **Flexible Pre-Processing**
- Form validation and enrichment
- Business logic and routing rules
- Automated responses before agent assignment

✅ **Better Control**
- Conditional routing based on form data
- Integration with external systems
- Custom business workflows

✅ **Enhanced Analytics**
- Flow execution tracking
- Step-by-step analytics
- Custom metrics and reporting

## Testing

1. Start the server: `npm run server`
2. Open the webchat widget
3. Fill out the form and submit
4. Check Studio Flow console for the new execution
5. Verify the flow parameters are passed correctly

## Troubleshooting

- **Flow not triggering**: Check `STUDIO_FLOW_SID` is correct
- **Conversation SID missing**: Verify `CONVERSATIONS_SERVICE_SID` is set
- **Parameters missing**: Verify form data is being passed correctly
- **Flow execution fails**: Check Studio Flow logs for detailed error messages

## Alternative: Webhook-Based Approach

If you prefer to use webhooks instead of direct API calls, you can:

1. Set up a webhook endpoint in your Studio Flow
2. Modify the controller to send a webhook request instead of using the Studio API
3. This approach can be more flexible for complex integrations
