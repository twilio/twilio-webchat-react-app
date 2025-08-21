const Twilio = require("twilio");

let twilioClient;

const getTwilioClient = () => {
    if (twilioClient) {
        return twilioClient;
    }

    // Use staging credentials which are properly configured
    const newClient = new Twilio(
        process.env.TWILIO_ACCOUNT_SID_STAGING || process.env.ACCOUNT_SID, 
        process.env.TWILIO_AUTH_TOKEN_STAGING || process.env.AUTH_TOKEN
    );

    twilioClient = newClient;

    return newClient;
};

module.exports = { getTwilioClient };
