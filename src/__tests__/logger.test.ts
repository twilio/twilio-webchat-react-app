import { Logger } from "loglevel";
import { init , getClassLogger } from "../logger";

describe("loggerManager", () => {
    it("should show a proper message if an invalid log level `DEBUG` is selected", () => {
        const consoleLogSpy = jest.spyOn(global.console, "error");

        init("debug");

        expect(consoleLogSpy).toHaveBeenCalled();
    });

    describe("logger", () => {
        beforeAll(() => {
            Object.defineProperty(window, "Twilio", {
                value: {}
            });
        });

        beforeEach(() => {
            init("info");
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it("should add the new logger to the logger map", () => {
            const className = "testName";
            const consoleLogSpy = jest.spyOn(global.console, "info");

            const logger = getClassLogger(className);
            logger.info("test message");

            expect(consoleLogSpy).toHaveBeenCalledWith(`[${className}]: test message`);
        });

        it("should add a logger with LEVEL `error`", () => {
            const className = "testName";
            const consoleLogSpy = jest.spyOn(global.console, "error");

            const logger = getClassLogger(className);
            logger.error("test message");

            expect(consoleLogSpy).toHaveBeenCalledWith(`[${className}]: test message`);
        });
    });
});
