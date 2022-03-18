const jwt = require("jsonwebtoken");
const { TOKEN_TTL_IN_SECONDS } = require("../constants");
const { createToken } = require("../helpers/createToken");
const { logInitialAction, logFinalAction, logInterimAction } = require("../helpers/logs");

const refreshTokenController = async (request, response) => {
    logInitialAction("Refreshing token");
    let providedIdentity;

    try {
        const validatedToken = await new Promise((res, rej) =>
            jwt.verify(request.body.token, process.env.API_SECRET, {}, (err, decoded) => {
                if (err) return rej(err);
                return res(decoded);
            })
        );
        providedIdentity = validatedToken?.grants?.identity;
    } catch (e) {
        logInterimAction("Invalid token provided:", e.message);
        return response.sendStatus(403);
    }

    logInterimAction("Token is valid for", providedIdentity);

    const refreshedToken = createToken(providedIdentity);

    response.send({
        token: refreshedToken,
        expiration: Date.now() + TOKEN_TTL_IN_SECONDS * 1000
    });

    logFinalAction("Token refreshed");
};

module.exports = { refreshTokenController };
