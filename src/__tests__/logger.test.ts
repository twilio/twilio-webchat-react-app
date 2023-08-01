import loggerManager, { createLogger } from "../logger";

describe("logger", () => {
    beforeAll(() => {
        Object.defineProperty(window, "Twilio", {
            value: {}
        });
    });

    beforeEach(() => {
        loggerManager("info");
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should have a map of loggers after initializing", () => {
        expect(window.Twilio.logMap).toBeTruthy();
    });

    it("should add the new logger to the logger map", () => {
        const className = "testName";
        const consoleLogSpy = jest.spyOn(global.console, "info");

        window.Twilio.addLogs(className, "test message", "info");

        expect(consoleLogSpy).toBeCalled();
        expect(window.Twilio.logMap.get(className)).toBeTruthy();
    });

    it("should add a logger with LEVEL `error`", () => {
        const className = "testName";
        const consoleLogSpy = jest.spyOn(global.console, "warn");

        window.Twilio.addLogs(className, "test message", "warn");

        expect(consoleLogSpy).toBeCalled();
    });
    it("should add a logger with LEVEL `warn`", () => {
        const className = "testName";
        const consoleLogSpy = jest.spyOn(global.console, "error");

        window.Twilio.addLogs(className, "test message", "error");

        expect(consoleLogSpy).toBeCalled();
    });

    describe("createLogger", () => {
        it("should return a logger for a given Classname and Log Level", () => {
            const className = "testName";
            createLogger(className, "warn");
            expect(window.Twilio.logMap.get(className)).toBeTruthy();
        });
    });
});
