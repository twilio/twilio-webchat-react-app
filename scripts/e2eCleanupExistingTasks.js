const params = process.argv.slice(2);
const Twilio = require("twilio");

const getParams = () => {
    const { accountSid, authToken } = params.reduce((acc, arg) => {
        const [, key, val] = arg.match(/(\w*)=(\S*)/) || [];

        if (key) {
            acc[key] = val;
        }

        return acc;
    }, {});

    return { accountSid, authToken };
};

const cleanupTasks = async () => {
    const { accountSid, authToken } = getParams();
    console.log("getting client");
    const client = new Twilio(accountSid, authToken);

    console.log("getting workspace");
    const [{ sid: workspaceSid }] = await client.taskrouter.workspaces.list();

    console.log("getting tasks");
    const tasks = await client.taskrouter.workspaces(workspaceSid).tasks.list();

    console.log("proceeding to remove older tasks");
    await Promise.all(tasks.map((t) => t.remove()));
    console.log("done");
};

cleanupTasks();
