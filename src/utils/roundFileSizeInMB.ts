/*
 * Rounds filesize in bytes to megabytes, with 0-2 decimal places ensuring atleast 3 digits.
 * e.g. 100MB, 10.0MB, 1.00MB, 0.10MB, 0.01MB
 */
export const roundFileSizeInMB = (fileSizeInBytes: number): string => {
    const sizeInMB = fileSizeInBytes / 1024 / 1024;
    const decimalPlaces = Math.max(0, 3 - Math.ceil(Math.log10(sizeInMB + 1)));
    const roundedResult = sizeInMB.toFixed(decimalPlaces);
    return Number(roundedResult) > 0.01 ? roundedResult : "0.01";
};
