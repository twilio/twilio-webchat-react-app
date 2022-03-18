import { roundFileSizeInMB } from "./roundFileSizeInMB";

it.each([
    {
        sizeInBytes: 1048.58, // 0.001 MB
        displayInMegaBytes: "0.01"
    },
    {
        sizeInBytes: 10485.76, // 0.01 MB
        displayInMegaBytes: "0.01"
    },
    {
        sizeInBytes: 104857.6, // 0.1 MB
        displayInMegaBytes: "0.10"
    },
    {
        sizeInBytes: 1048576, // 1 MB
        displayInMegaBytes: "1.00"
    },
    {
        sizeInBytes: 10485760, // 10 MB
        displayInMegaBytes: "10.0"
    },
    {
        sizeInBytes: 104857600, // 100 MB
        displayInMegaBytes: "100"
    }
])("returns correctly rounded file size", async ({ sizeInBytes, displayInMegaBytes }) => {
    expect(roundFileSizeInMB(sizeInBytes)).toBe(displayInMegaBytes);
});
