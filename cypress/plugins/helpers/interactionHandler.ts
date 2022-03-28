import axios, { AxiosError, AxiosResponse } from "axios";
import { TaskInstance } from "twilio/lib/rest/taskrouter/v1/workspace/task";

import { getTaskAndReservationFromConversationSid, getWorker, setWorkerOnline } from "./getWorker";
import { getToken } from "./getToken";
import { getTwilioClient } from "./twilioClient";

const EVENT_BRIDGE_URL = "https://event-bridge.twilio.com/v1/wschannels";

const buildInteractionEndpoint = ({
    target,
    interactionSid,
    inviteSid,
    channelSid
}: {
    target: "Invites" | "Channels";
    interactionSid: string;
    channelSid: string;
    inviteSid: string;
}) => {
    const endpoint = `v1/Interactions/${interactionSid}`;
    if (target === "Invites") {
        return `${endpoint}/Channels/${channelSid}/Invites/${inviteSid || ""}`;
    }
    if (target === "Channels") {
        return `${endpoint}/Channels/${channelSid}`;
    }

    throw Error("wrong target");
};

const postRequest = async ({
    target,
    task,
    action,
    status,
    routing
}: {
    target: "Channels" | "Invites";
    task: TaskInstance;
    action: "accept" | "decline" | undefined;
    status: "close" | undefined;
    routing: { status: "close" | "wrapup" } | { type: "taskrouter"; properties: any; reservation: any } | undefined;
}): Promise<AxiosResponse> => {
    const { flexInteractionSid, flexInteractionChannelSid, flexChannelInviteSid } = JSON.parse(task.attributes);

    let data;

    try {
        data = await axios.post(EVENT_BRIDGE_URL, {
            url: buildInteractionEndpoint({
                target,
                interactionSid: flexInteractionSid,
                channelSid: flexInteractionChannelSid,
                inviteSid: flexChannelInviteSid
            }),
            method: "POST",
            params: {
                action,
                status,
                routing
            },
            token: await getToken()
        });
    } catch (e) {
        console.log("error on request", (e as AxiosError)?.response || e);
        throw (e as AxiosError)?.response?.data?.message || (e as Error).message;
    }

    return data;
};

export const acceptReservation = async ({ conversationSid }: { conversationSid: string }) => {
    await new Promise((res) => setTimeout(res, 5000)); // Add buffer to avoid api calls being made too close together

    await setWorkerOnline();

    const { task, reservation } = await getTaskAndReservationFromConversationSid(conversationSid, {
        fetchReservation: true
    });

    console.log("accepting reservation");

    try {
        await postRequest({
            task,
            action: "accept",
            target: "Invites",
            routing: {
                type: "taskrouter",
                properties: {},
                reservation: {
                    sid: reservation.sid
                }
            },
            status: undefined
        });
    } catch (e) {
        throw Error(`Couldn't accept reservation: ${e}`);
    }

    return "reservation accepted";
};

export const sendMessage = async ({ conversationSid, messageText }) => {
    const client = await getTwilioClient();
    const worker = await getWorker();
    const message = await client.conversations
        .conversations(conversationSid)
        .messages.create({ author: worker.friendlyName, body: messageText });
    console.log(`Message ${message.sid} sent by Agent: ${worker.friendlyName}`);
    return "The message has been sent by Agent";
};

export const wrapReservation = async ({ conversationSid }: { conversationSid: string }) => {
    await new Promise((res) => setTimeout(res, 2000)); // Add buffer to avoid api calls being made too close together

    const { task } = await getTaskAndReservationFromConversationSid(conversationSid);
    console.log("wrapping reservation");

    try {
        await postRequest({
            task,
            action: undefined,
            target: "Channels",
            routing: { status: "wrapup" },
            status: "close"
        });
    } catch (e) {
        throw Error(`Couldn't wrap reservation up: ${e}`);
    }
    return "reservation wrapped";
};

export const completeReservation = async ({ conversationSid }: { conversationSid: string }) => {
    await new Promise((res) => setTimeout(res, 2000)); // Add buffer to avoid api calls being made too close together

    const { task } = await getTaskAndReservationFromConversationSid(conversationSid);
    console.log("completing reservation");

    try {
        await postRequest({
            task,
            action: undefined,
            target: "Channels",
            routing: { status: "close" },
            status: "close"
        });
    } catch (e) {
        throw Error(`Couldn't complete reservation: ${e}`);
    }

    await new Promise((res) => setTimeout(res, 5000));

    const updatedTask = await task.fetch();
    if (!["completed", "canceled"].includes(updatedTask.assignmentStatus)) {
        await updatedTask.remove();
        console.log("deleting task");
    }
    return "reservation completed";
};

export const getCustomerName = async ({ conversationSid }: { conversationSid: string }) => {
    await new Promise((res) => setTimeout(res, 2000)); // Add buffer to avoid api calls being made too close together

    const { task } = await getTaskAndReservationFromConversationSid(conversationSid);
    return JSON.parse(task.attributes).from;
};

export const getLastMessageMediaData = async ({ conversationSid }: { conversationSid: string }) => {
    await new Promise((res) => setTimeout(res, 2000)); // Add buffer to avoid api calls being made too close together

    const client = await getTwilioClient();
    const messageIM = await client.conversations
        .conversations(conversationSid)
        .messages.list({ order: "desc", limit: 1 });
    return messageIM[0].media[0].filename;
};

export const getLastMessageText = async ({ conversationSid }: { conversationSid: string }) => {
    const client = await getTwilioClient();
    const messageIM = await client.conversations
        .conversations(conversationSid)
        .messages.list({ order: "desc", limit: 1 });
    return messageIM[0].body;
};

export const validateAttachmentLink = async ({ conversationSid }: { conversationSid: string }) => {
    const client = await getTwilioClient();
    const messageIM = await client.conversations
        .conversations(conversationSid)
        .messages.list({ order: "desc", limit: 1 });
    const mediaSid = messageIM[0].media[0].sid;
    const options = {
        method: "GET",
        url: `https://mcs.us1.twilio.com/v1/Services/ISefe4b42a882440c0adcfd843a197151a/Media/${mediaSid}`,
        auth: {
            username: client.username,
            password: client.password
        },
        headers: {
            Accept: "*/*"
        }
    };

    return new Promise((resolve, reject) => {
        axios
            .request(options)
            .then((response) => {
                resolve(response.data.url);
            })
            .catch((err) => {
                // result = null;
                return reject(err);
            });
    });
};
