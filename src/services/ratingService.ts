interface RatingSubmission {
    conversationSid: string;
    rating: number;
    feedback?: string;
    customerEmail?: string;
    agentIdentity?: string;
    agentName?: string; // Add agent name field
    agentEmail?: string; // Add agent email field
    workerSid?: string; // Add worker SID field
    closureType: 'agent_closed' | 'customer_closed';
    timestamp: Date;
}

class RatingService {
    private serverUrl: string;

    constructor() {
        this.serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:3002';
    }

    /**
     * Submit a service rating
     */
    async submitRating(ratingData: RatingSubmission): Promise<boolean> {
        try {
            const response = await fetch(`${this.serverUrl}/submitRating`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ratingData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.success === true;
        } catch (error) {
            console.error('Error submitting rating:', error);
            throw error;
        }
    }

    /**
     * Check if a conversation has already been rated
     */
    async hasBeenRated(conversationSid: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.serverUrl}/hasBeenRated?conversationSid=${conversationSid}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.hasBeenRated === true;
        } catch (error) {
            console.error('Error checking rating status:', error);
            return false; // Default to false if we can't check
        }
    }
}

export const ratingService = new RatingService();
export type { RatingSubmission };
