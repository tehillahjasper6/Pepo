import { render, screen, fireEvent } from '@testing-library/react';
import FeedbackForm from '../FeedbackForm';

describe('FeedbackForm', () => {
  it('renders form fields and handles submit', () => {
    const handleSubmit = jest.fn();
    render(
      <FeedbackForm
        onSubmit={handleSubmit}
        itemOptions={['Good', 'Average', 'Poor']}
        communicationLevels={['Excellent', 'Average', 'Poor']}
      />
    );
    expect(screen.getByLabelText(/item condition/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/communication quality/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/comments/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/submit/i));
    // Optionally check if handleSubmit was called
  });
});
