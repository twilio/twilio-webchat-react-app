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
    const [{ sid: workspaceSid }] = await client.taskrouter.v1.workspaces.list();

    console.log("getting tasks");
    const tasks = await client.taskrouter.v1.workspaces(workspaceSid).tasks.list();

    console.log("proceeding to remove older tasks: ", tasks.length);
    await Promise.all(tasks.map((t) => {
        console.log("deleting task: ", t.sid);
        return t.remove()
    }));
    console.log("done");
};

cleanupTasks();
