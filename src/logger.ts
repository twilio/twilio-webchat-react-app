import log, { Logger, LogLevelDesc } from "loglevel";

const VALID_LOGLEVELS: Array<LogLevelDesc> = ["info", "warn", "error"];

export default class GenerateLogger {
    className: string;
    logger: Logger;

    constructor(className: string) {
        this.className = className;
        this.logger = log.getLogger(this.className);
    }

    info(message: string) {
        this.logger.info(`[${this.className}]: ${message}`);
    }
    warn(message: string) {
        this.logger.warn(`[${this.className}]: ${message}`);
    }
    error(message: string) {
        this.logger.error(`[${this.className}]: ${message}`);
    }
}

export const { initialize: init, getWebChatLogger: getClassLogger } = (function () {
    const logDump = new Map();

    function initialize(level: LogLevelDesc = "info") {
        if (!VALID_LOGLEVELS.includes(level)) {
            console.error(`Invalid Log Level -> ${level}. Select level higher than INFO or more.`);
            return;
        }

        log.setLevel("info");
        log.info("Logger has been initialized.");
    }

    function getWebChatLogger(className: string) {
        let classLogger = logDump.get(className);
        if (!classLogger) {
            classLogger = new GenerateLogger(className);
            logDump.set(className, classLogger);
        }

        return classLogger;
    }

    return {
        initialize,
        getWebChatLogger
    };
})();
