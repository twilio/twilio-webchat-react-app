import { Participant, User, Conversation } from "@twilio/conversations";

import { LocalStorageUtil } from "./LocalStorage";

const LOCALSTORAGE_PARTICIPANTS_LIST = "PARTICIPANTS_LIST";
const NAME_COUNT = "NAME_COUNT";

const storeAndUpdateParticipants = (participants: Participant[], conversation: Conversation) => {
    const newParticipantList = {
        participants,
        conversationSid: conversation.sid
    };

    LocalStorageUtil.set(LOCALSTORAGE_PARTICIPANTS_LIST, newParticipantList);
};

export const createParticipantNameMap = (participants: Participant[], users: User[], conversation: Conversation) => {
    const participantStore = LocalStorageUtil.get(LOCALSTORAGE_PARTICIPANTS_LIST) ?? {};
    let participantMap = participantStore?.participants || [];
    if (Object.keys(participantStore).length === 0 || participantStore.conversationSid !== conversation.sid) {
        participantMap = participants.reduce((acc: { [key: string]: string }, p) => {
            const user = users.find((u) => u.identity === p.identity);
            if (user) {
                acc[p.sid] = user.friendlyName;
            }
            return acc;
        }, {});
        storeAndUpdateParticipants(participantMap, conversation);
    }

    return participantMap;
};

export const updatePraticipants = (participant: Participant, name: string) => {
    const participantStore = LocalStorageUtil.get(LOCALSTORAGE_PARTICIPANTS_LIST);

    if (participantStore === null) {
        return;
    }
    participantStore.participants = {
        ...(participantStore?.participants || {}),
        [participant.sid]: name
    };

    LocalStorageUtil.set(LOCALSTORAGE_PARTICIPANTS_LIST, participantStore);
};

export const removeParticpantMap = () => {
    LocalStorageUtil.set(LOCALSTORAGE_PARTICIPANTS_LIST, {});
    LocalStorageUtil.set(NAME_COUNT, 0);
};


export const customAgentName = () => {
    const baseName = 'Agent';
    let count = parseInt(LocalStorageUtil.get(NAME_COUNT),10) || 0;
    count += 1;
    LocalStorageUtil.set(NAME_COUNT, count.toString());
    return `${baseName} ${count}`;
}