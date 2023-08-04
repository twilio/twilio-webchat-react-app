import log, { Logger, LogLevelDesc } from "loglevel";

const VALID_LOGLEVELS: Array<LogLevelDesc> = ["info", "warn", "error"];
export type addLogsType = (className: string, message: string, logLevel?: LogLevelDesc) => void;

export const createLogger = (className: string, logLevel: LogLevelDesc): Logger => {
    const logger = log.getLogger(className);
    logger.setLevel(logLevel);
    logger.info(`${className} logger is initialised`);
    window.Twilio.logDump.set(className, logger);
    return logger;
};

function loggerManager(level?: LogLevelDesc): void {
    if (!level || !VALID_LOGLEVELS.includes(level)) {
        console.error(`Invalid Log Level -> ${level}. Select level higher than INFO or more.`);
        return;
    }

    log.info("Logger has been initialized.");
    Object.assign(window.Twilio, {
        ...window.Twilio,
        logDump: new Map(),
        addLogs(className: string, message: string, logLevel: LogLevelDesc = "info") {
            let webchatLogger = this.logDump.get(className);
            const newLogEntry = `${className} > ${message}`;
            webchatLogger = webchatLogger || createLogger(className, logLevel);
            switch (logLevel) {
                case "warn": {
                    webchatLogger.warn(newLogEntry);
                    break;
                }
                case "error": {
                    webchatLogger.error(newLogEntry);
                    break;
                }
                default: {
                    webchatLogger.info(newLogEntry);
                    break;
                }
            }
        },
        getWebChatLogger(className: string) {
            return this.logDump.get(className);
        }
    });
}

export default loggerManager;
