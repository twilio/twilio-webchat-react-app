import { jwt } from "twilio";

import { getWorker } from "./getWorker";

const getJwt = (identity: string, grants: any[], { ttl }: { ttl?: number } = {}) => {
    const { AccessToken } = jwt;

    const token = new AccessToken(process.env.ACCOUNT_SID!, process.env.API_KEY!, process.env.API_SECRET!, {
        identity,
        ttl: ttl || 60 * 5
    });

    grants.forEach((g) => token.addGrant(g));

    return token.toJwt();
};

const getToken = async () => {
    const worker = await getWorker();
    const attributes = JSON.parse(worker.attributes);
    const identity = attributes.contact_uri.replace(/client:/, "");
    const { AccessToken } = jwt;

    const grant = new AccessToken.TaskRouterGrant({
        workspaceSid: worker.workspaceSid,
        workerSid: worker.sid,
        role: "worker"
    });
    return getJwt(identity, [grant]);
};

export { getToken };
