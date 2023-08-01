import log, { Logger, LogLevelDesc } from "loglevel";

export type addLogsType = (className: string, message: string, level: LogLevelDesc) => void;

export const createLogger = (className: string, logLevel: LogLevelDesc): Logger => {
    const logger = log.getLogger(className);
    logger.setLevel(logLevel);
    logger.info(`${className} logger is initialised`);
    window.Twilio.logMap.set(className, logger);
    return logger;
};

function loggerManager(level?: LogLevelDesc): void {
    if(!level || (level < log.levels.INFO)) {
        log.error(`Invalid Log Level -> ${level}. Select level higher than INFO or more.`);
        return;
    }
    const defaultLevel = level ?? "info";
    log.info("Logger has been initialized.");
    Object.assign(window.Twilio, {
        ...window.Twilio,
        logMap: new Map(),
        addLogs(className: string, message: string, logLevel: LogLevelDesc = "info") {
            let webchatLogger = this.logMap.get(className);
            const newLogEntry = `${className} > ${message}`;
            if (!webchatLogger) {
                webchatLogger = createLogger(className, logLevel);
            }
            switch(logLevel) {
                case 'warn': {
                    webchatLogger.warn(newLogEntry);
                    break;
                }
                case 'error': {
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
            return this.logMap.get(className);
        }
    });
}

export default loggerManager;
