const { allowedOrigins } = require("../helpers/getAllowedOrigins");
const validateRequestOriginMiddleware = (request, response, next) => {
    if (!process.env.ALLOWED_ORIGINS) {
        console.error("Please specify at least one ALLOWED_ORIGINS in your environment");
        return response.sendStatus(500);
    }

    const requestOrigin = request.get("origin");

    // If request origin is not included in the ALLOWED_ORIGINS list, throw an error
    if (!allowedOrigins.includes(requestOrigin)) {
        console.error(`Request origin '${requestOrigin}' not allowed`);
        return response.sendStatus(403);
    }
    response.setHeader("Access-Control-Allow-Methods", "OPTIONS, POST");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.setHeader("Content-Type", "application/json");

    next();
};

module.exports = { validateRequestOriginMiddleware };
