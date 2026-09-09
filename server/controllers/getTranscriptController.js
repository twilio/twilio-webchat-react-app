const jwt = require("jsonwebtoken");
const axios = require("axios");
const { getTwilioClient } = require("../helpers/getTwilioClient");
const { logInitialAction, logFinalAction, logInterimAction } = require("../helpers/logs");

// The Media Content Service (MCS) that generates temporary download URLs isn't wrapped by the
// `twilio` Node SDK at all - the browser SDK's own getContentTemporaryUrl() talks to it via a
// separate, dedicated client (@twilio/mcs-client). Replicated here with plain account-level
// Basic Auth, matching the exact path documented in that package: GET
// /v1/Services/{serviceSid}/Media/{mediaSid} on https://mcs.<region>.twilio.com, reading
// `links.content_direct_temporary` from the response. Confirmed working directly against a
// real attachment before writing this.
const getTemporaryMediaUrl = async (mediaSid) => {
    const region = process.env.TWILIO_REGION || "us1";
    const url = `https://mcs.${region}.twilio.com/v1/Services/${process.env.CONVERSATIONS_SERVICE_SID}/Media/${mediaSid}`;
    const { data } = await axios.get(url, {
        auth: { username: process.env.ACCOUNT_SID, password: process.env.AUTH_TOKEN }
    });
    return data.links.content_direct_temporary;
};

// Once a conversation is closed (e.g. the agent ends the chat), Twilio denies the customer's
// own identity-scoped access to it - even with a brand new token - while the underlying
// participant record itself still exists. This endpoint uses our account-level Twilio client
// (same one used elsewhere in this server) to read a closed conversation on the customer's
// behalf, so a page reload can still show the transcript instead of a hard failure.
const getTranscriptController = async (request, response) => {
    logInitialAction("Fetching transcript for a closed conversation");
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

    const { conversationSid } = request.body;
    if (!conversationSid) {
        return response.sendStatus(400);
    }

    try {
        const client = getTwilioClient();
        const conversationResource = client.conversations.v1.conversations(conversationSid);

        const [conversation, participantResources] = await Promise.all([
            conversationResource.fetch(),
            conversationResource.participants.list()
        ]);

        // Only ever hand back a transcript to someone who was actually part of this conversation.
        const isParticipant = participantResources.some((p) => p.identity === providedIdentity);
        if (!isParticipant) {
            logInterimAction("Identity is not a participant of this conversation:", providedIdentity);
            return response.sendStatus(403);
        }

        const messageResources = await conversationResource.messages.list();

        const uniqueIdentities = Array.from(new Set(participantResources.map((p) => p.identity).filter(Boolean)));
        const userResources = await Promise.all(
            uniqueIdentities.map((identity) =>
                client.conversations.v1
                    .users(identity)
                    .fetch()
                    .catch(() => null)
            )
        );

        const messages = await Promise.all(
            messageResources.map(async (m) => ({
                sid: m.sid,
                index: m.index,
                author: m.author,
                body: m.body,
                dateCreated: m.dateCreated,
                dateUpdated: m.dateUpdated,
                participantSid: m.participantSid,
                type: m.media ? "media" : "text",
                attachedMedia: m.media
                    ? await Promise.all(
                          m.media.map(async (media) => ({
                              sid: media.sid,
                              filename: media.filename,
                              contentType: media.content_type,
                              size: media.size,
                              // Best-effort: a single attachment failing to get a temporary URL
                              // (e.g. it happened to expire mid-request) shouldn't break the
                              // whole transcript - it'll just be undownloadable on its own,
                              // same graceful degradation Transcript.tsx already has.
                              temporaryUrl: await getTemporaryMediaUrl(media.sid).catch((e) => {
                                  logInterimAction(`Couldn't get temporary URL for media ${media.sid}:`, e.message);
                                  return null;
                              })
                          }))
                      )
                    : null
            }))
        );

        response.send({
            conversationState: conversation.state,
            conversationDateCreated: conversation.dateCreated,
            messages,
            participants: participantResources.map((p) => ({
                sid: p.sid,
                identity: p.identity,
                lastReadMessageIndex: p.lastReadMessageIndex,
                isTyping: false
            })),
            users: userResources.filter(Boolean).map((u) => ({ identity: u.identity, friendlyName: u.friendlyName }))
        });

        logFinalAction("Transcript fetched for closed conversation");
    } catch (e) {
        logInterimAction("Failed fetching transcript:", e.message);
        return response.sendStatus(500);
    }
};

module.exports = { getTranscriptController };
