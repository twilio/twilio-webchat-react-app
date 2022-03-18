/*
 * Gets the number of days between the given date and the current date.
 * e.g. if today is 10/01/2022 then 08/01/2022 returns 2
 */
export const getDaysOld = (date: Date): number => {
    const messageDate = new Date(date.getTime());
    messageDate.setUTCHours(0);
    messageDate.setUTCMinutes(0);
    messageDate.setUTCSeconds(0, 0);

    const currentDate = new Date();
    currentDate.setUTCHours(0);
    currentDate.setUTCMinutes(0);
    currentDate.setUTCSeconds(0, 0);

    const timeDiff = currentDate.getTime() - messageDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
};
