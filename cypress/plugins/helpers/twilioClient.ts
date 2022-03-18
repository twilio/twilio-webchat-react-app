import { Twilio } from "twilio";

let twilioClient: Twilio;

export const getTwilioClient = () => {
    if (twilioClient) {
        return twilioClient;
    }

    twilioClient = new Twilio(process.env.ACCOUNT_SID!, process.env.AUTH_TOKEN!);
    return twilioClient;
};
