require("dotenv").config();
const express = require("express");

const { validateRequestOriginMiddleware } = require("./middlewares/validateRequestOriginMiddleware");
const { initWebchatController } = require("./controllers/initWebchatController");
const { refreshTokenController } = require("./controllers/refreshTokenController");
const { sendMessage } = require("./helpers/email");

const cors = require("cors");
const { allowedOrigins } = require("./helpers/getAllowedOrigins");

const app = express();
const port = 3001;

app.use(express.json());
app.use(
    cors({
        origins: allowedOrigins
    })
);
app.listen(port, () => {
    console.log(`Twilio Webchat App server running on port ${port}`);
});

app.post("/api/initWebchat", validateRequestOriginMiddleware, initWebchatController);
app.post("/api/refreshToken", validateRequestOriginMiddleware, refreshTokenController);

app.post("/email", async (req, res) => {
    try {
        const message = await sendMessage(req.body);
        res.json(message);
    } catch (err) {
        console.error(err);
    }
});
