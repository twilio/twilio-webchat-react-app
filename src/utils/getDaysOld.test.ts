import { getDaysOld } from "./getDaysOld";

describe("getDaysOld", () => {
    it.each([0, 1, 2, 5, 10, 100, 500, 1000])("when supplied x days ago date, should return x", (daysAgo: number) => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);

        expect(getDaysOld(date)).toBe(daysAgo);
    });
});
