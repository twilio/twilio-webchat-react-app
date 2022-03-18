import { WorkerInstance } from "twilio/lib/rest/taskrouter/v1/workspace/worker";
import { ActivityInstance } from "twilio/lib/rest/taskrouter/v1/workspace/activity";

import { getTwilioClient } from "./twilioClient";

let worker: WorkerInstance;
let workerActivities: ActivityInstance[];

const taskByConversationSidCache = new Map();

export const getWorker = async () => {
    if (worker) {
        return worker;
    }
    const client = await getTwilioClient();

    const [workspace] = await client.taskrouter.workspaces.list({ limit: 1 });

    [worker] = await client.taskrouter.workspaces(workspace.sid).workers.list({ limit: 1 });

    return worker;
};

const getWorkerActivities = async () => {
    if (!worker) {
        await getWorker();
    }
    if (workerActivities) {
        return workerActivities;
    }
    const client = await getTwilioClient();

    workerActivities = await client.taskrouter.workspaces(worker.workspaceSid).activities.list();

    return workerActivities;
};

export const setWorkerOnline = async () => {
    if (!worker) {
        await getWorker();
    }
    workerActivities = await getWorkerActivities();

    const onlineActivitySid = workerActivities.find((a) => a.available)?.sid;

    if (worker.activitySid === onlineActivitySid) {
        return;
    }
    try {
        await worker.update({ activitySid: onlineActivitySid });
    } catch (e) {
        console.log(e);
    }
};

export const getTaskAndReservationFromConversationSid = async (
    conversationSid: string,
    { fetchReservation } = { fetchReservation: false }
) => {
    let { task, reservation } = taskByConversationSidCache.get(conversationSid) || {};

    if (!task) {
        if (!worker) {
            await getWorker();
        }
        console.log(`getting task for conversation ${conversationSid}`);
        const client = await getTwilioClient();

        [task] = await client.taskrouter
            .workspaces(worker.workspaceSid)
            .tasks.list({ evaluateTaskAttributes: `conversationSid == "${conversationSid}"` });

        if (!task) {
            throw Error(`Couldn't find a task with conversationSid === ${conversationSid}`);
        }

        console.log(`got task ${task.sid}`);

        taskByConversationSidCache.set(conversationSid, { task });
    }

    if (fetchReservation && !reservation) {
        const reservations = await task.reservations().list({ reservationStatus: "pending" });

        reservation = reservations.find((r) => r.workerSid === worker.sid);

        if (!reservation) {
            throw Error(`Couldn't find a pending reservation for task ${task.sid} for worker ${worker.sid}`);
        }

        console.log(`got reservation ${reservation.sid}`);

        taskByConversationSidCache.set(conversationSid, { task, reservation });
    }

    return { task, reservation };
};
