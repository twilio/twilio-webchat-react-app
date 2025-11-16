import { Twilio } from "twilio";

let twilioClient: Twilio;

export const getTwilioClient = () => {
    if (twilioClient) {
        return twilioClient;
    }

    twilioClient = new Twilio(
        process.env.API_KEY!, 
        process.env.API_SECRET!,
        { accountSid: process.env.ACCOUNT_SID! }
    );
    return twilioClient;
};
