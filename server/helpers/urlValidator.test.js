const dns = require("dns").promises;

const { validateMediaUrl, isPrivateIP } = require("./urlValidator");

jest.mock("dns", () => ({
    promises: {
        resolve4: jest.fn(),
        resolve6: jest.fn()
    }
}));

describe("isPrivateIP", () => {
    it.each([
        ["127.0.0.1", true], // loopback
        ["10.0.0.5", true], // RFC1918
        ["172.16.0.1", true], // RFC1918
        ["172.31.255.255", true], // RFC1918 (upper bound)
        ["192.168.1.1", true], // RFC1918
        ["169.254.169.254", true], // link-local / AWS metadata
        ["0.0.0.0", true],
        ["::1", true], // IPv6 loopback
        ["fc00::1", true], // IPv6 unique local
        ["fe80::1", true], // IPv6 link-local
        ["8.8.8.8", false], // public
        ["93.184.216.34", false] // public
    ])("treats %s as private=%s", (ip, expected) => {
        expect(isPrivateIP(ip)).toBe(expected);
    });
});

describe("validateMediaUrl", () => {
    beforeEach(() => {
        dns.resolve4.mockReset();
        dns.resolve6.mockReset();
    });

    it("rejects an unparsable URL", async () => {
        await expect(validateMediaUrl("not a url")).rejects.toThrow("Invalid URL format");
    });

    it("rejects a non-HTTPS URL", async () => {
        await expect(validateMediaUrl("http://example.com/file.png")).rejects.toThrow("Only HTTPS URLs allowed");
    });

    it("rejects localhost", async () => {
        await expect(validateMediaUrl("https://localhost/file.png")).rejects.toThrow("localhost not allowed");
    });

    it("rejects localhost regardless of case", async () => {
        await expect(validateMediaUrl("https://LocalHost/file.png")).rejects.toThrow("localhost not allowed");
    });

    it("rejects a private IPv4 literal", async () => {
        await expect(validateMediaUrl("https://127.0.0.1/file.png")).rejects.toThrow(
            "Private IP addresses not allowed"
        );
    });

    it("rejects the AWS metadata address", async () => {
        await expect(validateMediaUrl("https://169.254.169.254/latest/meta-data")).rejects.toThrow(
            "Private IP addresses not allowed"
        );
    });

    it("rejects an IPv6 loopback literal", async () => {
        await expect(validateMediaUrl("https://[::1]/file.png")).rejects.toThrow("Private IP addresses not allowed");
    });

    it("rejects an IPv6 unique-local literal", async () => {
        await expect(validateMediaUrl("https://[fc00::1]/file.png")).rejects.toThrow(
            "Private IP addresses not allowed"
        );
    });

    it("rejects an IPv6 link-local literal", async () => {
        await expect(validateMediaUrl("https://[fe80::1]/file.png")).rejects.toThrow(
            "Private IP addresses not allowed"
        );
    });

    it("allows a public IPv4 literal", async () => {
        await expect(validateMediaUrl("https://8.8.8.8/file.png")).resolves.toBe("https://8.8.8.8/file.png");
    });

    it("allows a public IPv6 literal", async () => {
        await expect(validateMediaUrl("https://[2001:4860:4860::8888]/file.png")).resolves.toBe(
            "https://[2001:4860:4860::8888]/file.png"
        );
    });

    it("allows a normal public hostname that resolves to public IPs", async () => {
        dns.resolve4.mockResolvedValue(["93.184.216.34"]);
        dns.resolve6.mockResolvedValue([]);

        await expect(validateMediaUrl("https://example.com/file.png")).resolves.toBe(
            "https://example.com/file.png"
        );
    });

    it("rejects a hostname that DNS-resolves (A record) to a private IP - DNS rebinding", async () => {
        dns.resolve4.mockResolvedValue(["127.0.0.1"]);
        dns.resolve6.mockResolvedValue([]);

        await expect(validateMediaUrl("https://sneaky.example.com/file.png")).rejects.toThrow();
    });

    it("rejects a hostname that DNS-resolves (AAAA record) to a private IP - DNS rebinding", async () => {
        dns.resolve4.mockResolvedValue([]);
        dns.resolve6.mockResolvedValue(["fe80::1"]);

        await expect(validateMediaUrl("https://sneaky.example.com/file.png")).rejects.toThrow();
    });

    it("allows a hostname with no DNS records at all (treated as unresolvable, not malicious)", async () => {
        dns.resolve4.mockRejectedValue(Object.assign(new Error("not found"), { code: "ENOTFOUND" }));
        dns.resolve6.mockRejectedValue(Object.assign(new Error("not found"), { code: "ENOTFOUND" }));

        await expect(validateMediaUrl("https://does-not-exist.example.com/file.png")).resolves.toBe(
            "https://does-not-exist.example.com/file.png"
        );
    });
});
