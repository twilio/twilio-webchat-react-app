const Twilio = require("twilio");
const { TOKEN_TTL_IN_SECONDS } = require("../constants");
const { logInterimAction } = require("./logs");

const createToken = (identity) => {
    logInterimAction("Creating new token");
    const { AccessToken } = Twilio.jwt;
    const { ChatGrant, TaskRouterGrant } = AccessToken;

    const chatGrant = new ChatGrant({
        serviceSid: process.env.CONVERSATIONS_SERVICE_SID
    });

    const taskRouterGrant = new TaskRouterGrant({
        workspaceSid: process.env.TASKROUTER_WORKSPACE_SID,
        workerSid: process.env.TASKROUTER_WORKER_SID || undefined
    });

    const token = new AccessToken(process.env.ACCOUNT_SID, process.env.API_KEY, process.env.API_SECRET, {
        identity,
        ttl: TOKEN_TTL_IN_SECONDS
    });
    token.addGrant(chatGrant);
    token.addGrant(taskRouterGrant);
    const jwt = token.toJwt();
    logInterimAction("New token created");
    return jwt;
};

module.exports = { createToken };
