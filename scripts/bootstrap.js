const fs = require("fs");
const params = process.argv.slice(2);

const getParams = () => {
    const { accountSid, authToken, apiKey, apiSecret, deploymentKey, region } = params.reduce(
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
    if (!deploymentKey) {
        throw "Please provide a valid `deploymentKey`";
    }


    return { accountSid, authToken, apiKey, apiSecret, region, deploymentKey };
};

const getInitialEnvFile = () => {
    try {
        return fs.readFileSync(".env.sample").toString();
    } catch (e) {
        throw "Couldn't read an .env.sample file.";
    }
};
try {
    const { accountSid, apiKey, apiSecret, authToken, region, deploymentKey } = getParams();

    let envFileContent = getInitialEnvFile()
        .replace(/(?<=ACCOUNT_SID=)(\w*)/gm, accountSid)
        .replace(/(?<=AUTH_TOKEN=)(\w*)/gm, authToken)
        .replace(/(?<=API_KEY=)(\w*)/gm, apiKey)
        .replace(/(?<=API_SECRET=)(\w*)/gm, apiSecret)
        .replace(/(?<=REACT_APP_DEPLOYMENT_KEY=)(\w*)/gm, deploymentKey)
        .replace(/(?<=REACT_APP_REGION=)(\w*)/gm, region)

    fs.writeFileSync(".env", envFileContent);

    console.log("✅ Project bootstrapped");
} catch (e) {
    console.error(`❌ Bootstrap script aborted: ${e}`);
}
