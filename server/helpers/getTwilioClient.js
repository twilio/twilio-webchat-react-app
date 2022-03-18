const Twilio = require("twilio");

let twilioClient;

const getTwilioClient = () => {
    if (twilioClient) {
        return twilioClient;
    }

    const newClient = new Twilio(process.env.API_KEY, process.env.API_SECRET, {
        accountSid: process.env.ACCOUNT_SID,
        region: process.env.TWILIO_REGION
    });

    twilioClient = newClient;

    return newClient;
};

module.exports = { getTwilioClient };
