const escapeHtml = (value) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const doubleDigit = (number) => `${number < 10 ? 0 : ""}${number}`;

const generateDuration = (transcriptData) => {
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

const getUniqueFilenames = (transcriptData) => {
    const seenFilenames = {};
    const uniqueFilenames = [];
    for (const message of transcriptData) {
        for (const media of message.media) {
            const { filename } = media;
            if (Object.prototype.hasOwnProperty.call(seenFilenames, filename)) {
                const fileExtension = filename.split(".").pop() || "";
                const filenameStart = filename.split(fileExtension)[0].slice(0, -1);
                uniqueFilenames.push(`${filenameStart}-${seenFilenames[filename]}.${fileExtension}`);
                seenFilenames[filename] += 1;
            } else {
                seenFilenames[filename] = 1;
                uniqueFilenames.push(filename);
            }
        }
    }
    return uniqueFilenames;
};

const getAgentNames = (customerName, transcriptData) => {
    const names = transcriptData.map((message) => message.author?.trim());
    return Array.from(new Set(names.filter((name) => name !== customerName && name !== "Concierge")));
};

const generateEmailTranscript = (customerName, agentNames, transcriptData) => {
    const conversationStartDate = transcriptData[0].timeStamp.toLocaleString("default", { dateStyle: "long" });
    const duration = generateDuration(transcriptData);
    const uniqueFilenames = getUniqueFilenames(transcriptData);
    let mediaMessageIndex = 0;

    let conversationTitle = `Chat with <strong>${escapeHtml(customerName)}</strong>`;
    agentNames.forEach(
        (name) => (conversationTitle = conversationTitle.concat(` and <strong>${escapeHtml(name)}</strong>`))
    );

    let transcript = `${conversationTitle}<br><br><strong>Date:</strong> ${conversationStartDate}<br><strong>Duration:</strong> ${duration}<br><br>`;
    for (const message of transcriptData) {
        let messageText = `${doubleDigit(message.timeStamp.getHours())}:${doubleDigit(
            message.timeStamp.getMinutes()
        )} <i>${escapeHtml(message.author)}</i>: ${escapeHtml(message.body)}`;
        for (let i = 0; i < message.media.length; i++) {
            messageText = messageText.concat(
                ` (** Attached file <i>${escapeHtml(uniqueFilenames[mediaMessageIndex + i])}</i> **)`
            );
        }
        mediaMessageIndex += message.media.length;
        transcript = transcript.concat(`${messageText}<br><br>`);
    }
    return transcript;
};

const generateEmailContent = (customerName, transcript) =>
    `<div><h1 style="text-align:center;">Chat Transcript</h1><p>Hello ${escapeHtml(
        customerName
    )},<br><br>Please see below your transcript, with any associated files attached, as requested.<br><br>${transcript}</p></div>`;

module.exports = { getUniqueFilenames, getAgentNames, generateEmailTranscript, generateEmailContent };
