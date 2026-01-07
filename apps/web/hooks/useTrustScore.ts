import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';

export interface TrustScoreData {
  userId: string;
  totalScore: number;
  trustLevel: string;
  givingScore: number;
  receivingScore: number;
  feedbackScore: number;
  completionRate: number;
  responseTime: number;
}

export interface TrustProfile {
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isVerified: boolean;
    createdAt: string;
  };
  trustScore: TrustScoreData;
  stats: {
    createdGiveaways: number;
    completedParticipations: number;
    totalParticipations: number;
    averageRating: number;
  };
}

/**
 * Hook to fetch and manage trust score for a user
 */
export const useTrustScore = (userId?: string) => {
  const [score, setScore] = useState<TrustScoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrustScore = useCallback(async (id: string) => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await apiClient(`/trust-score/users/${id}`, {
        method: 'GET',
      });
      setScore(response.trustScore);
      setError(null);
    } catch (err) {
      setError('Failed to load trust score');
      console.error('Error fetching trust score:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTrustScore(userId);
    }
  }, [userId, fetchTrustScore]);

  return { score, loading, error, refetch: fetchTrustScore };
};

/**
 * Hook to fetch detailed trust profile for a user
 */
export const useTrustProfile = (userId?: string) => {
  const [profile, setProfile] = useState<TrustProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (id: string) => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await apiClient(`/trust-score/profile/${id}`, {
        method: 'GET',
      });
      setProfile(response);
      setError(null);
    } catch (err) {
      setError('Failed to load trust profile');
      console.error('Error fetching trust profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    }
  }, [userId, fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
};

/**
 * Hook to fetch trust score leaderboard
 */
export const useTrustLeaderboard = (limit: number = 10) => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient(`/trust-score/leaderboard/${limit}`, {
        method: 'GET',
      });
      setLeaderboard(response.leaderboard || []);
      setError(null);
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { leaderboard, loading, error, refetch: fetchLeaderboard };
};

/**
 * Helper function to determine trust level badge
 */
export const getTrustLevelBadge = (
  trustLevel: string
): { label: string; emoji: string; color: string } => {
  const badges: Record<
    string,
    { label: string; emoji: string; color: string }
  > = {
    HIGHLY_TRUSTED: {
      label: 'Highly Trusted',
      emoji: '⭐⭐⭐',
      color: 'text-green-600',
    },
    TRUSTED: {
      label: 'Trusted',
      emoji: '⭐⭐',
      color: 'text-blue-600',
    },
    EMERGING: {
      label: 'Emerging',
      emoji: '⭐',
      color: 'text-yellow-600',
    },
    NEW: { label: 'New Member', emoji: '→', color: 'text-gray-600' },
  };

  return badges[trustLevel] || badges.NEW;
};

/**
 * Helper function to determine color based on score
 */
export const getScoreColor = (
  score: number
): {
  textColor: string;
  bgColor: string;
  borderColor: string;
} => {
  if (score >= 90) {
    return {
      textColor: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
    };
  } else if (score >= 75) {
    return {
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300',
    };
  } else if (score >= 60) {
    return {
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300',
    };
  } else if (score >= 40) {
    return {
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-300',
    };
  } else {
    return {
      textColor: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300',
    };
  }
};
