import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Mock the hook used by the component
vi.mock('@/hooks/useFollows', () => ({
  useMyFollows: () => ({
    data: {
      data: [
        {
          id: 'follow1',
          ngoId: 'ngo1',
          createdAt: new Date().toISOString(),
          ngo: {
            organizationName: 'Test NGO',
            category: 'health',
            impactScore: 0.42,
            followerCount: 1234,
          },
        },
      ],
      pagination: { page: 1, pages: 1, total: 1 },
    },
    isLoading: false,
    error: null,
  }),
}));

import { MyFollows } from '../MyFollows';

describe('MyFollows', () => {
  it('renders followed NGO list', () => {
    render(<MyFollows />);
    expect(screen.getByText(/My Follows/i)).toBeInTheDocument();
    expect(screen.getByText(/Test NGO/i)).toBeInTheDocument();
    expect(screen.getByText(/1 followers|1 follower|1 followers/i)).toBeDefined();
  });
});
