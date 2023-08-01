import log, { LogLevelDesc } from "loglevel";

export type addLogsType = (className: string, message: string, level: LogLevelDesc) => void;

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
        addLogs(className: string, message: string, logLevel: LogLevelDesc) {
            let webchatLogger = this.logMap.get(className);
            const newLogEntry = `${className} > ${message}`;
            switch(logLevel) {
                case 'warn': {
                    if (!webchatLogger) {
                        webchatLogger = log.getLogger(className);
                        webchatLogger.setLevel(defaultLevel ?? logLevel);
                        webchatLogger.info(`${className} logger is initialised`);
                        this.logMap.set(className, webchatLogger);
                    }

                    webchatLogger.warn(newLogEntry);
                    break;
                }
                case 'error': {
                    if (!webchatLogger) {
                        webchatLogger = log.getLogger(className);
                        webchatLogger.setLevel(defaultLevel ?? logLevel);
                        webchatLogger.info(`${className} logger is initialised`);
                        this.logMap.set(className, webchatLogger);
                    }

                    webchatLogger.error(newLogEntry);
                    break;
                }
                default: {
                    if (!webchatLogger) {
                        webchatLogger = log.getLogger(className);
                        webchatLogger.setLevel(defaultLevel ?? logLevel);
                        // webchatLogger.enableAll();
                        webchatLogger.info(`${className} logger is initialised`);
                        this.logMap.set(className, webchatLogger);
                    }
                    
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
