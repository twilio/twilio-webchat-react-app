const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim());

module.exports = { allowedOrigins };
