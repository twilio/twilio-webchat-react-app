import { Twilio } from "twilio";

import { parseRegionForTwilioClient } from "./regionUtil";

let twilioClient: Twilio;

export const getTwilioClient = () => {
    if (twilioClient) {
        return twilioClient;
    }

    console.log("hello world twilioClient", parseRegionForTwilioClient(process.env.REACT_APP_REGION));
    twilioClient = new Twilio(process.env.ACCOUNT_SID!, process.env.AUTH_TOKEN!, {
        region: parseRegionForTwilioClient(process.env.REACT_APP_REGION)
    });
    return twilioClient;
};
