import log from "loglevel";

import { initLogger } from "../logger";

describe("logger", () => {
    it("should initialize a logger with debug level and no persistence", () => {
        const spy = jest.spyOn(log, "setLevel");
        initLogger();
        expect(spy).toHaveBeenCalledWith("debug", false);
    });
});
