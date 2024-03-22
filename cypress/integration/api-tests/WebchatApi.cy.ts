describe("Webchat API tests", () => {
    const requestHeaders = {
        "x-twilio-sec-decoders": {
            audio: { powerEfficient: true, smooth: true, supported: true, keySystemAccess: null },
            video: { powerEfficient: false, smooth: false, supported: false, keySystemAccess: null }
        },
        "x-twilio-sec-usersettings": { language: "en-GB", cookieEnabled: true, userTimezone: -330 },
        "x-twilio-sec-webchatinfo": { loginTimestamp: "1711075540530" },
        Origin: "http://localhost:3000",
        "Content-Type": "application/x-www-form-urlencoded"
    };
    beforeEach(() => {
        cy.visit("");
    });

    it("should reuse Customer Identity", () => {
        cy.request({
            method: "POST",
            url: "https://flex-api.twilio.com/v2/Webchat/Init",
            headers: requestHeaders,
            body: {
                DeploymentKey: "CVfc3b7a7fd67ae94ebfb444898a27d44d",
                CustomerFriendlyName: "Customer",
                PreEngagementData: JSON.stringify({
                    friendlyName: "Test Client",
                    email: "mdeshpande@twilio.com",
                    query: "Hello"
                })
            }
        }).its("body").then((body) => {
            let customerIdentity = body.identity;
            cy.request({
                method: "POST",
                url: "https://flex-api.twilio.com/v2/Webchat/Init",
                headers: requestHeaders,
                body: {
                    DeploymentKey: "CVfc3b7a7fd67ae94ebfb444898a27d44d",
                    CustomerFriendlyName: "Customer",
                    PreEngagementData: JSON.stringify({
                        friendlyName: "Test Client",
                        email: "mdeshpande@twilio.com",
                        query: "Hello"
                    }),
                    Identity: customerIdentity
                }
            }).should((response) => {
                expect(response.status).to.eq(201);
                expect(response.body.identity).to.eq(customerIdentity);
            });
        });
    });
});
