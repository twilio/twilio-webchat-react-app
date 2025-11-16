const { getTwilioClient } = require("../helpers/getTwilioClient");
const { logInterimAction } = require("../helpers/logs");

// In-memory storage for ratings (in production, use a database)
const ratings = new Map();

/**
 * Create a new TaskRouter task to log rating data
 */
const createRatingLogTask = async (ratingData) => {
    try {
        const twilioClient = getTwilioClient();
        
        // Use workspace SID from environment variable
        const workspaceSid = process.env.WORKSPACE_SID;
        if (!workspaceSid) {
            logInterimAction("WORKSPACE_SID environment variable not set for rating log task");
            return false;
        }

        // Use a specific workflow SID for rating logs
        // You can set this as an environment variable or use a specific workflow
        const ratingWorkflowSid = process.env.RATING_WORKFLOW_SID || workspace.workflowSid;

        // Create task attributes for rating logging
        const taskAttributes = {
            taskType: "rating_log",
            conversationSid: ratingData.conversationSid,
            rating: ratingData.rating,
            feedback: ratingData.feedback || "",
            customerEmail: ratingData.customerEmail || "",
            agentIdentity: ratingData.agentIdentity || "",
            agentName: ratingData.agentName || "", // Add agent name to task attributes
            agentEmail: ratingData.agentEmail || "", // Add agent email from worker attributes
            workerSid: ratingData.workerSid || "", // Add worker SID for reference
            closureType: ratingData.closureType,
            timestamp: ratingData.timestamp.toISOString()
        };

        // Create the task with the rating workflow
        const task = await twilioClient.taskrouter
            .workspaces(workspaceSid)
            .tasks.create({
                attributes: JSON.stringify(taskAttributes),
                workflowSid: ratingWorkflowSid,
                timeout: 600 // 10 minutes in seconds
            });

        logInterimAction(`Rating log task created: ${task.sid} for conversation ${ratingData.conversationSid} using workspace ${workspaceSid} and workflow ${ratingWorkflowSid}`);
        return true;

    } catch (error) {
        logInterimAction(`Error creating rating log task: ${error.message}`);
        return false;
    }
};
/**
 * Submit a service rating
 */
const submitRatingController = async (request, response) => {
    try {
        const { conversationSid, rating, feedback, customerEmail, agentIdentity, agentName, agentEmail, workerSid, closureType } = request.body;

        if (!conversationSid || !rating) {
            return response.status(400).json({ error: "Missing required fields" });
        }

        const ratingData = {
            conversationSid,
            rating,
            feedback,
            customerEmail,
            agentIdentity,
            agentName, // Add agent name to rating data
            agentEmail, // Add agent email from worker attributes
            workerSid, // Add worker SID for reference
            closureType,
            timestamp: new Date(),
        };

        // Log the rating data received from frontend
        logInterimAction(`Rating data received from frontend: ${JSON.stringify(ratingData)}`);

        // Store rating in memory
        ratings.set(conversationSid, ratingData);
        logInterimAction(`Rating submitted for conversation ${conversationSid}: ${rating}/5 stars`);

        // Create a new task to log the rating data
        const taskCreated = await createRatingLogTask(ratingData);
        if (taskCreated) {
            logInterimAction(`Rating log task created successfully for conversation ${conversationSid}`);
        } else {
            logInterimAction(`Failed to create rating log task for conversation ${conversationSid}`);
        }

        response.json({ success: true, message: "Rating submitted successfully" });

    } catch (error) {
        logInterimAction(`Error submitting rating: ${error.message}`);
        response.status(500).json({ error: "Failed to submit rating" });
    }
};

/**
 * Check if a conversation has already been rated
 */
const hasBeenRatedController = async (request, response) => {
    try {
        const { conversationSid } = request.query;

        if (!conversationSid) {
            return response.status(400).json({ error: "Conversation SID is required" });
        }

        // Check if rating exists in memory
        const hasRated = ratings.has(conversationSid);
        
        response.json({ hasRated });

    } catch (error) {
        logInterimAction(`Error checking rating status: ${error.message}`);
        response.status(500).json({ error: "Failed to check rating status" });
    }
};

/**
 * Get all ratings (for admin purposes)
 */
const getAllRatingsController = async (request, response) => {
    try {
        // Convert Map to array of rating objects
        const allRatings = Array.from(ratings.values());
        
        response.json({ 
            success: true, 
            ratings: allRatings,
            count: allRatings.length 
        });

    } catch (error) {
        logInterimAction(`Error getting all ratings: ${error.message}`);
        response.status(500).json({ error: "Failed to get ratings" });
    }
};

/**
 * Get worker attributes by agent identity
 */
const getWorkerAttributesController = async (request, response) => {
    try {
        const { agentIdentity } = request.body;

        if (!agentIdentity) {
            return response.status(400).json({ error: "Agent identity is required" });
        }

        const twilioClient = getTwilioClient();
        
        // Use workspace SID from environment variable
        const workspaceSid = process.env.WORKSPACE_SID;
        if (!workspaceSid) {
            logInterimAction("WORKSPACE_SID environment variable not set for worker attributes lookup");
            return response.status(500).json({ error: "Workspace SID not configured" });
        }

        try {
            // Find worker by identity (friendlyName)
            const workers = await twilioClient.taskrouter
                .workspaces(workspaceSid)
                .workers.list({ friendlyName: agentIdentity });
            
            if (workers.length > 0) {
                const worker = workers[0];
                const attributes = JSON.parse(worker.attributes || '{}');
                
                const workerData = {
                    workerSid: worker.sid,
                    workerIdentity: worker.identity,
                    workerFriendlyName: worker.friendlyName,
                    workerEmail: attributes.email || "",
                    workerAttributes: attributes,
                    workspaceSid: workspaceSid
                };
                
                logInterimAction(`Found worker attributes for agent ${agentIdentity}: ${worker.sid}`);
                response.json(workerData);
            } else {
                logInterimAction(`No worker found for agent identity: ${agentIdentity}`);
                response.status(404).json({ error: "Worker not found" });
            }
        } catch (error) {
            logInterimAction(`Error fetching worker attributes: ${error.message}`);
            response.status(500).json({ error: "Failed to fetch worker attributes" });
        }

    } catch (error) {
        logInterimAction(`Error in getWorkerAttributesController: ${error.message}`);
        response.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    submitRatingController,
    hasBeenRatedController,
    getAllRatingsController,
    getWorkerAttributesController
};
