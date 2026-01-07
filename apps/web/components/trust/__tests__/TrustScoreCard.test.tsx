import { render, screen } from '@testing-library/react';
import TrustScoreCard from '../TrustScoreCard';

describe('TrustScoreCard', () => {
  it('renders trust tier and score breakdown', () => {
    render(
      <TrustScoreCard
        trustTier="Gold"
        score={85}
        breakdown={{ giving: 30, receiving: 40, feedback: 15 }}
        metrics={{ completionRate: 98, responseTime: 2 }}
      />
    );
    expect(screen.getByText(/Gold/)).toBeInTheDocument();
    expect(screen.getByText(/85/)).toBeInTheDocument();
    expect(screen.getByText(/giving/i)).toBeInTheDocument();
    expect(screen.getByText(/completion rate/i)).toBeInTheDocument();
  });
});
