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

    if (hostname === "localhost") {
        throw new Error("localhost not allowed");
    }

    // URL keeps the brackets on an IPv6 literal (e.g. "[::1]"), but net.isIP() only
    // recognizes bracket-free notation ("::1") - without stripping them first, every
    // bracketed IPv6 address (the only way IPv6 literals appear in a URL) falls through
    // to the DNS-lookup branch below, where the lookup on the literal "[::1]" string just
    // fails and is silently treated as "no records found", letting it through unchecked.
    const isBracketedIPv6 = hostname.startsWith("[") && hostname.endsWith("]");
    const ipCandidate = isBracketedIPv6 ? hostname.slice(1, -1) : hostname;

    if (net.isIP(ipCandidate)) {
        if (isPrivateIP(ipCandidate)) {
            throw new Error("Private IP addresses not allowed");
        }
    } else {
        try {
            const ipv4Addresses = await dns.resolve4(hostname).catch(() => []);
            if (ipv4Addresses.some(isPrivateIP)) {
                throw new Error("URL resolves to private IP");
            }

            const ipv6Addresses = await dns.resolve6(hostname).catch(() => []);
            if (ipv6Addresses.some(isPrivateIP)) {
                throw new Error("URL resolves to private IPv6");
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
