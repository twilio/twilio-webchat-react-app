const { URL } = require("url");
const dns = require("dns").promises;
const net = require("net");

const PRIVATE_IP_RANGES = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^0\./,
    /^::1$/,
    /^fc00:/,
    /^fe80:/
];

const isPrivateIP = (ip) => {
    return PRIVATE_IP_RANGES.some((range) => range.test(ip));
};

const validateMediaUrl = async (urlString) => {
    let parsedUrl;
    try {
        parsedUrl = new URL(urlString);
    } catch {
        throw new Error("Invalid URL format");
    }

    if (parsedUrl.protocol !== "https:") {
        throw new Error("Only HTTPS URLs allowed");
    }

    const hostname = parsedUrl.hostname.toLowerCase();

    if (net.isIP(hostname)) {
        if (isPrivateIP(hostname)) {
            throw new Error("Private IP addresses not allowed");
        }
    } else {
        try {
            const addresses = await dns.resolve4(hostname);
            if (addresses.some(isPrivateIP)) {
                throw new Error("URL resolves to private IP");
            }
        } catch (dnsError) {
            if (dnsError.code !== "ENODATA" && dnsError.code !== "ENOTFOUND") {
                throw new Error(`DNS resolution failed: ${dnsError.message}`);
            }
        }
    }

    return parsedUrl.href;
};

module.exports = { validateMediaUrl, isPrivateIP };
