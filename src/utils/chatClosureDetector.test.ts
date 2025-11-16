import { ChatClosureDetector, ChatClosureEvent } from './chatClosureDetector';
import { Conversation, Participant } from '@twilio/conversations';

// Mock the Conversation class
jest.mock('@twilio/conversations', () => ({
    Conversation: jest.fn(),
    Participant: jest.fn()
}));

describe('ChatClosureDetector', () => {
    let detector: ChatClosureDetector;
    let mockConversation: jest.Mocked<Conversation>;
    let mockParticipant: jest.Mocked<Participant>;

    beforeEach(() => {
        mockConversation = {
            addListener: jest.fn(),
            removeAllListeners: jest.fn(),
            state: { current: 'active' },
            localParticipant: { identity: 'customer@example.com' }
        } as any;

        mockParticipant = {
            getUser: jest.fn()
        } as any;

        detector = new ChatClosureDetector(mockConversation);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('onChatClosed', () => {
        it('should add callback to the list', () => {
            const callback = jest.fn();
            detector.onChatClosed(callback);
            
            // Trigger a callback manually to test
            const event: ChatClosureEvent = {
                type: 'conversation_closed',
                timestamp: new Date(),
                reason: 'test'
            };
            
            // Access private method for testing
            (detector as any).triggerCallbacks(event);
            
            expect(callback).toHaveBeenCalledWith(event);
        });
    });

    describe('offChatClosed', () => {
        it('should remove callback from the list', () => {
            const callback = jest.fn();
            detector.onChatClosed(callback);
            detector.offChatClosed(callback);
            
            // Trigger a callback manually to test
            const event: ChatClosureEvent = {
                type: 'conversation_closed',
                timestamp: new Date(),
                reason: 'test'
            };
            
            // Access private method for testing
            (detector as any).triggerCallbacks(event);
            
            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('startListening', () => {
        it('should add conversation listeners', () => {
            detector.startListening();
            
            expect(mockConversation.addListener).toHaveBeenCalledWith('updated', expect.any(Function));
            expect(mockConversation.addListener).toHaveBeenCalledWith('participantLeft', expect.any(Function));
        });

        it('should not add listeners if already listening', () => {
            detector.startListening();
            detector.startListening();
            
            // Should only be called once for each event
            expect(mockConversation.addListener).toHaveBeenCalledTimes(2);
        });
    });

    describe('stopListening', () => {
        it('should remove all listeners', () => {
            detector.startListening();
            detector.stopListening();
            
            expect(mockConversation.removeAllListeners).toHaveBeenCalled();
        });
    });

    describe('isChatClosed', () => {
        it('should return true when conversation is closed', () => {
            Object.defineProperty(mockConversation, 'state', {
                value: { current: 'closed' },
                writable: true
            });
            expect(detector.isChatClosed()).toBe(true);
        });

        it('should return true when conversation is inactive', () => {
            Object.defineProperty(mockConversation, 'state', {
                value: { current: 'inactive' },
                writable: true
            });
            expect(detector.isChatClosed()).toBe(false);
        });

        it('should return false when conversation is active', () => {
            Object.defineProperty(mockConversation, 'state', {
                value: { current: 'active' },
                writable: true
            });
            expect(detector.isChatClosed()).toBe(false);
        });
    });

    describe('getConversationState', () => {
        it('should return current conversation state', () => {
            Object.defineProperty(mockConversation, 'state', {
                value: { current: 'closed' },
                writable: true
            });
            expect(detector.getConversationState()).toBe('closed');
        });
    });
});
