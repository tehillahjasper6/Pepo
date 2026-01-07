import { render, screen } from '@testing-library/react';
import Recommendations from '../Recommendations';

describe('Recommendations', () => {
  it('renders a list of recommendations', () => {
    const recommendations = [
      {
        id: '1',
        title: 'Giveaway 1',
        category: 'Books',
        matchScore: 90,
        distance: 2,
        giver: { name: 'Alice', trustScore: 80 },
        reasons: ['Proximity', 'Interest'],
        participantCount: 5,
        image: '/img1.png',
      },
    ];
    render(<Recommendations recommendations={recommendations} />);
    expect(screen.getByText(/Giveaway 1/)).toBeInTheDocument();
    expect(screen.getByText(/Books/)).toBeInTheDocument();
    expect(screen.getByText(/90/)).toBeInTheDocument();
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
  });
});
