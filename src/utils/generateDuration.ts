import { Transcript } from "./generateTranscripts";

export const generateDuration = (transcriptData: Transcript[]) => {
    let deltaInSeconds =
        (transcriptData[transcriptData.length - 1].timeStamp.getTime() - transcriptData[0].timeStamp.getTime()) / 1000;

    const days = Math.floor(deltaInSeconds / (24 * 60 * 60));
    deltaInSeconds -= days * (24 * 60 * 60);
    const hours = Math.floor(deltaInSeconds / (60 * 60)) % 24;
    deltaInSeconds -= hours * (60 * 60);
    const minutes = Math.floor(deltaInSeconds / 60) % 60;
    deltaInSeconds -= minutes * 60;
    const seconds = Math.round(deltaInSeconds % 60);

    const displayedDays = days > 0 ? `${days} ${days === 1 ? "day" : "days"} ` : "";
    const displayedHours = hours > 0 ? `${hours} ${hours === 1 ? "hour" : "hours"} ` : "";
    const displayedMinutes = minutes > 0 ? `${minutes} ${minutes === 1 ? "minute" : "minutes"} ` : "";
    const displayedSeconds = seconds > 0 ? `${seconds} ${seconds === 1 ? "second" : "seconds"} ` : "";

    return `${displayedDays}${displayedHours}${displayedMinutes}${displayedSeconds}`;
};
