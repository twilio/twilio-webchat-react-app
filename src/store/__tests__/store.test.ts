import { store } from "../store";

describe("store", () => {
    it("should expose a store with the correct branches", () => {
        expect(store).toBeDefined();
        expect(store.getState().chat).toBeDefined();
        expect(store.getState().config).toBeDefined();
        expect(store.getState().notifications).toBeDefined();
        expect(store.getState().session).toBeDefined();
    });
});
