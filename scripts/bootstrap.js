const fs = require("fs");
const params = process.argv.slice(2);

const getParams = () => {
    const { accountSid, authToken, addressSid, apiKey, apiSecret, conversationsServiceSid } = params.reduce(
        (acc, arg) => {
            const [, key, val] = arg.match(/(\w*)=(\S*)/) || [];

            if (key) {
                acc[key] = val;
            }

            return acc;
        },
        {}
    );

    if (!accountSid) {
        throw "Please provide a valid `accountSid`";
    }
    if (!authToken) {
        throw "Please provide a valid `authToken`";
    }
    if (!apiKey) {
        throw "Please provide a valid `apiKey`. More info at https://www.twilio.com/docs/glossary/what-is-an-api-key#how-can-i-create-api-keys";
    }
    if (!apiSecret) {
        throw "Please provide a valid `apiSecret`. More info https://www.twilio.com/docs/glossary/what-is-an-api-key#how-can-i-create-api-keys";
    }
    if (!addressSid) {
        throw "Please provide a valid `addressSid`";
    }
    if (!conversationsServiceSid) {
        throw "Please provide a valid `conversationsServiceSid`";
    }

    return { accountSid, authToken, addressSid, apiKey, apiSecret, conversationsServiceSid };
};

const getInitialEnvFile = () => {
    try {
        return fs.readFileSync(".env.sample").toString();
    } catch (e) {
        throw "Couldn't read an .env.sample file.";
    }
};
try {
    const { accountSid, addressSid, apiKey, apiSecret, authToken, conversationsServiceSid } = getParams();

    let envFileContent = getInitialEnvFile()
        .replace(/(?<=ACCOUNT_SID=)(\w*)/gm, accountSid)
        .replace(/(?<=AUTH_TOKEN=)(\w*)/gm, authToken)
        .replace(/(?<=API_KEY=)(\w*)/gm, apiKey)
        .replace(/(?<=API_SECRET=)(\w*)/gm, apiSecret)
        .replace(/(?<=ADDRESS_SID=)(\w*)/gm, addressSid)
        .replace(/(?<=CONVERSATIONS_SERVICE_SID=)(\w*)/gm, conversationsServiceSid);

    fs.writeFileSync(".env", envFileContent);

    console.log("✅  Project bootstrapped");
} catch (e) {
    console.error(`❌  Bootstrap script aborted: ${e}`);
}
