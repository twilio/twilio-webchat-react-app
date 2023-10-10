const Twilio = require("twilio");

const { parseRegionForTwilioClient } = require("../../shared/regionUtil");

let twilioClient;

const getTwilioClient = () => {
    if (twilioClient) {
        return twilioClient;
    }

    const newClient = new Twilio(process.env.API_KEY, process.env.API_SECRET, {
        accountSid: process.env.ACCOUNT_SID,
        region: parseRegionForTwilioClient(process.env.REACT_APP_REGION)
    });

    twilioClient = newClient;

    return newClient;
};

module.exports = { getTwilioClient };
