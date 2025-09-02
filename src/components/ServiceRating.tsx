import React, { useState } from "react";
import { Box, Text, Button, Modal, ModalHeading, ModalBody, ModalFooter, ModalFooterActions } from "@twilio-paste/core";

interface ServiceRatingProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, feedback?: string) => void;
    onSkip: () => void;
    isLoading?: boolean;
}

export const ServiceRating: React.FC<ServiceRatingProps> = ({
    isOpen,
    onClose,
    onSubmit,
    onSkip,
    isLoading = false
}) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState("");

    const handleStarClick = (starRating: number) => {
        setRating(starRating);
    };

    const handleStarHover = (starRating: number) => {
        setHoverRating(starRating);
    };

    const handleStarLeave = () => {
        setHoverRating(0);
    };

    const handleSubmit = () => {
        if (rating > 0) {
            onSubmit(rating, feedback);
        }
    };

    const handleClose = () => {
        setRating(0);
        setFeedback("");
        setHoverRating(0);
        onClose();
    };

    const renderStars = () => {
        const stars = [];
        const maxStars = 5;
        const displayRating = hoverRating || rating;

        for (let i = 1; i <= maxStars; i++) {
            stars.push(
                <Box
                    key={i}
                    as="button"
                    type="button"
                    onClick={() => handleStarClick(i)}
                    onMouseEnter={() => handleStarHover(i)}
                    onMouseLeave={handleStarLeave}
                    backgroundColor="transparent"
                    border="none"
                    cursor="pointer"
                    padding="space20"
                    marginRight="space10"
                    borderRadius="borderRadius20"
                    _hover={{
                        backgroundColor: "colorBackgroundPrimaryWeak",
                        transform: "scale(1.1)"
                    }}
                    transition="all 0.2s"
                    aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}
                >
                    <Text
                        as="span"
                        fontSize="fontSize60"
                        color={i <= displayRating ? "colorTextIconSuccess" : "colorTextWeak"}
                        fontWeight="fontWeightBold"
                    >
                        ★
                    </Text>
                </Box>
            );
        }
        return stars;
    };

    const getRatingText = () => {
        if (rating === 0) return "How would you rate your experience?";
        if (rating === 1) return "Poor - We're sorry to hear that";
        if (rating === 2) return "Fair - We'll work to improve";
        if (rating === 3) return "Good - Thanks for your feedback";
        if (rating === 4) return "Very Good - We're glad you had a good experience";
        if (rating === 5) return "Excellent - Thank you for the perfect rating!";
        return "";
    };

    return (
        <Modal
            isOpen={isOpen}
            onDismiss={handleClose}
            size="default"
            ariaLabelledby="rating-modal-title"
        >
            <ModalHeading id="rating-modal-title">Rate Your Experience</ModalHeading>
            <ModalBody>
                <Box textAlign="center" paddingY="space60">
                    <Text as="p" variant="bodyText" marginBottom="space50">
                        {getRatingText()}
                    </Text>

                    <Box display="flex" justifyContent="center" marginBottom="space50">
                        {renderStars()}
                    </Box>

                    {rating > 0 && (
                        <Box marginTop="space50">
                            <Text as="label" variant="label" display="block" marginBottom="space30">
                                Additional Feedback (Optional)
                            </Text>
                            <textarea
                                value={feedback}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback(e.target.value)}
                                placeholder="Tell us about your experience..."
                                style={{
                                    width: '100%',
                                    minHeight: '80px',
                                    padding: '12px',
                                    border: '1px solid #c1c3c6',
                                    borderRadius: '4px',
                                    fontFamily: 'inherit',
                                    fontSize: '14px',
                                    resize: 'vertical'
                                }}
                            />
                        </Box>
                    )}
                </Box>
            </ModalBody>
            <ModalFooter>
                <ModalFooterActions>
                    <Button variant="secondary" onClick={onSkip} disabled={isLoading}>
                        Skip
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={rating === 0 || isLoading}
                        loading={isLoading}
                    >
                        Submit Rating
                    </Button>
                </ModalFooterActions>
            </ModalFooter>
        </Modal>
    );
};
