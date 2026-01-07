import { render, screen } from '@testing-library/react';
import EnvironmentalImpactCard from '../EnvironmentalImpactCard';

describe('EnvironmentalImpactCard', () => {
  it('renders CO2 saved and waste diverted', () => {
    render(
      <EnvironmentalImpactCard
        co2Saved={120}
        wasteDiverted={45}
        equivalents={{ trees: 2, carMiles: 10, bottles: 30, showers: 5 }}
        topCategories={[{ name: 'Books', value: 20 }]}
      />
    );
    expect(screen.getByText(/120/)).toBeInTheDocument();
    expect(screen.getByText(/45/)).toBeInTheDocument();
    expect(screen.getByText(/trees/)).toBeInTheDocument();
    expect(screen.getByText(/Books/)).toBeInTheDocument();
  });
});
