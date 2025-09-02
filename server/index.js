require("dotenv").config();
const express = require("express");
const path = require("path");

const { validateRequestOriginMiddleware } = require("./middlewares/validateRequestOriginMiddleware");
const { initWebchatController } = require("./controllers/initWebchatController");
const { refreshTokenController } = require("./controllers/refreshTokenController");
const { emailTranscriptController } = require("./controllers/emailTranscriptController");
const {
    submitRatingController,
    hasBeenRatedController,
    getAllRatingsController,
    getWorkerAttributesController
} = require("./controllers/ratingController");

const cors = require("cors");
const { allowedOrigins } = require("./helpers/getAllowedOrigins");

const app = express();
const port = 3002;

app.use(express.json());
app.use(
    cors({
        origins: allowedOrigins
    })
);

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../build')));

// API routes
app.post("/initWebchat", validateRequestOriginMiddleware, initWebchatController);
app.post("/refreshToken", validateRequestOriginMiddleware, refreshTokenController);
app.post("/email", validateRequestOriginMiddleware, emailTranscriptController);

// Rating routes
app.post("/submitRating", validateRequestOriginMiddleware, submitRatingController);
app.get("/hasBeenRated", validateRequestOriginMiddleware, hasBeenRatedController);
app.get("/ratings", validateRequestOriginMiddleware, getAllRatingsController);
app.post("/getWorkerAttributes", validateRequestOriginMiddleware, getWorkerAttributesController);

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(port, () => {
    console.log(`Twilio Webchat App server running on port ${port}`);
});
