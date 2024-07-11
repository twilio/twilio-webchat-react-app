/* eslint-disable import/no-unused-modules */
import { Participant, User } from "@twilio/conversations";

// return a map of participant sid to participant name
export const createParticipantNameMap = (participants: Participant[], users: User[]) => {
    return participants.reduce((acc: { [key: string]: string }, p) => {
        const user = users.find((u) => u.identity === p.identity);
        if (user) {
            acc[p.sid] = user.friendlyName;
        }
        return acc;
    }, {});
};
