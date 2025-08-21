# TaskRouter Integration Setup

This webchat widget now creates TaskRouter tasks for full Flex Insights coverage and control.

## Required Environment Variables

Create a `.env` file in the `server` directory with these variables:

```env
# Twilio Account Credentials
ACCOUNT_SID=your_twilio_account_sid
AUTH_TOKEN=your_twilio_auth_token

# Twilio API Keys (for token generation)
API_KEY=your_twilio_api_key
API_SECRET=your_twilio_api_secret

# Twilio Conversations Service
CONVERSATIONS_SERVICE_SID=your_conversations_service_sid

# TaskRouter Configuration
TASKROUTER_WORKSPACE_SID=your_taskrouter_workspace_sid
TASKROUTER_WORKFLOW_SID=your_taskrouter_workflow_sid

# Optional: SendGrid for email transcripts
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=your_verified_email@domain.com
```

## Setup Steps

### 1. Get Twilio Credentials
- **ACCOUNT_SID** and **AUTH_TOKEN**: From Twilio Console → Account → API Keys & Tokens
- **API_KEY** and **API_SECRET**: Create new API key in Twilio Console → Account → API Keys & Tokens

### 2. Get Conversations Service SID
- Go to Twilio Console → Conversations → Services
- Create a new service or use existing one
- Copy the Service SID

### 3. Get TaskRouter Workspace SID
- Go to Twilio Console → TaskRouter → Workspaces
- Use your Flex workspace or create a new one
- Copy the Workspace SID

### 4. Create TaskRouter Workflow
- Go to Twilio Console → TaskRouter → Workspaces → [Your Workspace] → Workflows
- Create a new workflow for webchat tasks
- Copy the Workflow SID

### 5. Configure Workflow
Your workflow should route tasks to agents. Example workflow configuration:

```json
{
  "task_routing": {
    "default_filter": {
      "queue": "your_agent_queue_sid"
    }
  }
}
```

### 6. Set Up Webhooks (Optional)
To automatically complete tasks when conversations end:

1. Go to Twilio Console → Conversations → Services → [Your Service] → Webhooks
2. Add webhook URL: `https://your-server.com/webhook/conversation`
3. Select events: `conversation.ended`

## Benefits

✅ **Full Flex Insights Coverage**
- Task lifecycle tracking
- Queue performance metrics
- Agent productivity data
- Custom attributes and routing data

✅ **Advanced Control**
- Custom routing logic
- Skill-based assignment
- Queue management
- SLA tracking

✅ **Complete Analytics**
- Task routing decisions
- Wait times
- Agent assignment times
- Custom business metrics

## Testing

1. Start the server: `cd server && npm start`
2. Open the webchat widget
3. Fill out the form and submit
4. Check TaskRouter console for the new task
5. Assign the task to an agent in Flex

The task will include all customer information and can be routed based on your workflow configuration.
