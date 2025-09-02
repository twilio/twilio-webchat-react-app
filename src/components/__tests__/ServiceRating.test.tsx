import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ServiceRating } from '../ServiceRating';

describe('ServiceRating', () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();
    const mockOnSkip = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders rating modal when open', () => {
        render(
            <ServiceRating
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                onSkip={mockOnSkip}
            />
        );

        expect(screen.getByText('Rate Your Experience')).toBeInTheDocument();
        expect(screen.getByText('How would you rate your experience?')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(
            <ServiceRating
                isOpen={false}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                onSkip={mockOnSkip}
            />
        );

        expect(screen.queryByText('Rate Your Experience')).not.toBeInTheDocument();
    });

    it('shows 5 stars', () => {
        render(
            <ServiceRating
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                onSkip={mockOnSkip}
            />
        );

        const stars = screen.getAllByRole('button', { name: /Rate \d+ star/ });
        expect(stars).toHaveLength(5);
    });

    it('allows rating selection', () => {
        render(
            <ServiceRating
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                onSkip={mockOnSkip}
            />
        );

        const thirdStar = screen.getByRole('button', { name: 'Rate 3 stars' });
        fireEvent.click(thirdStar);

        expect(screen.getByText('Good - Thanks for your feedback')).toBeInTheDocument();
    });

    it('shows feedback textarea when rating is selected', () => {
        render(
            <ServiceRating
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                onSkip={mockOnSkip}
            />
        );

        const thirdStar = screen.getByRole('button', { name: 'Rate 3 stars' });
        fireEvent.click(thirdStar);

        expect(screen.getByPlaceholderText('Tell us about your experience...')).toBeInTheDocument();
    });

    it('calls onSubmit with rating and feedback', async () => {
        render(
            <ServiceRating
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                onSkip={mockOnSkip}
            />
        );

        const thirdStar = screen.getByRole('button', { name: 'Rate 3 stars' });
        fireEvent.click(thirdStar);

        const feedbackTextarea = screen.getByPlaceholderText('Tell us about your experience...');
        fireEvent.change(feedbackTextarea, { target: { value: 'Great service!' } });

        const submitButton = screen.getByRole('button', { name: 'Submit Rating' });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(3, 'Great service!');
        });
    });

    it('calls onSkip when skip button is clicked', () => {
        render(
            <ServiceRating
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                onSkip={mockOnSkip}
            />
        );

        const skipButton = screen.getByRole('button', { name: 'Skip' });
        fireEvent.click(skipButton);

        expect(mockOnSkip).toHaveBeenCalled();
    });

    it('disables submit button when no rating is selected', () => {
        render(
            <ServiceRating
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                onSkip={mockOnSkip}
            />
        );

        const submitButton = screen.getByRole('button', { name: 'Submit Rating' });
        expect(submitButton).toHaveAttribute('disabled');
    });

    it('enables submit button when rating is selected', () => {
        render(
            <ServiceRating
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                onSkip={mockOnSkip}
            />
        );

        const thirdStar = screen.getByRole('button', { name: 'Rate 3 stars' });
        fireEvent.click(thirdStar);

        const submitButton = screen.getByRole('button', { name: 'Submit Rating' });
        expect(submitButton).not.toHaveAttribute('disabled');
    });

    it('shows loading state when isLoading is true', () => {
        render(
            <ServiceRating
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                onSkip={mockOnSkip}
                isLoading={true}
            />
        );

        const thirdStar = screen.getByRole('button', { name: 'Rate 3 stars' });
        fireEvent.click(thirdStar);

        const submitButton = screen.getByRole('button', { name: 'Submit Rating' });
        expect(submitButton).toHaveAttribute('disabled');
    });

    it('shows correct rating text for different ratings', () => {
        render(
            <ServiceRating
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                onSkip={mockOnSkip}
            />
        );

        // Test 1 star
        const firstStar = screen.getByRole('button', { name: 'Rate 1 star' });
        fireEvent.click(firstStar);
        expect(screen.getByText('Poor - We\'re sorry to hear that')).toBeInTheDocument();

        // Test 5 stars
        const fifthStar = screen.getByRole('button', { name: 'Rate 5 stars' });
        fireEvent.click(fifthStar);
        expect(screen.getByText('Excellent - Thank you for the perfect rating!')).toBeInTheDocument();
    });
});
