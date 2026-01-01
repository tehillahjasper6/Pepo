import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock the hook used by the component
// Mock lucide icons used in the component
vi.mock('lucide-react', () => ({
  Loader2: () => null,
  Search: () => null,
  Filter: () => null,
  ChevronLeft: () => null,
  ChevronRight: () => null,
}));

// Mock the FollowButton component to avoid additional imports
vi.mock('../FollowButton', () => ({
  FollowButton: () => {
    // Simple button stub for tests; avoid forwarding unknown props
    return <button>Follow</button>;
  },
}));

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
    expect(screen.getByText(/followers/i)).toBeInTheDocument();
  });
});
