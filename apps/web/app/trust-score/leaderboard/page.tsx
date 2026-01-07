'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { TrustScore, TrustScoreBadge, TrustScoreBar } from '@/components/TrustScore';
import Loading from '@/components/Loading';

interface LeaderboardUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  trustScore: {
    userId: string;
    totalScore: number;
    trustLevel: string;
    givingScore: number;
    receivingScore: number;
    feedbackScore: number;
    completionRate: number;
    responseTime: number;
  };
}

export default function TrustScoreLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  useEffect(() => {
    if (filterLevel === 'all') {
      setFilteredLeaderboard(leaderboard);
    } else {
      setFilteredLeaderboard(
        leaderboard.filter((user) => user.trustScore.trustLevel === filterLevel)
      );
    }
  }, [leaderboard, filterLevel]);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
        setError(null);
      const response = await apiClient('/trust-score/leaderboard/50', {
        method: 'GET',
      });
      setLeaderboard(response.leaderboard || []);
      setError(null);
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error('Error loading leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getTrustLevels = (data: LeaderboardUser[]) => {
    return [...new Set(data.map((u) => u.trustScore.trustLevel))];
  };

if (isLoading) {
  return <Loading message="Loading leaderboard..." />;
}

if (error) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-red-800 font-bold mb-2">Error loading leaderboard</h2>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => loadLeaderboard()}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-background-default">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Trust Score Leaderboard
          </h1>
          <p className="text-gray-600 mb-6">
            Recognize the most trusted members of our community
          </p>

          {/* Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterLevel('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterLevel === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Users
            </button>
            {getTrustLevels(leaderboard).map((level) => (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filterLevel === level
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <TrustScoreBadge trustLevel={level} />
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            <p>Loading leaderboard...</p>
          </div>
        ) : filteredLeaderboard.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No users found in this category</p>
          </div>
        ) : (
          <>
            {/* Top 3 - Special Display */}
            {filteredLeaderboard.slice(0, 3).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {filteredLeaderboard.slice(0, 3).map((user, index) => {
                  const rank = leaderboard.findIndex((u) => u.id === user.id) + 1;
                  return (
                    <div
                      key={user.id}
                      className={`card text-center p-6 border-2 ${
                        index === 0
                          ? 'border-yellow-400 shadow-lg scale-105'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="text-5xl mb-4">{getMedalEmoji(index + 1)}</div>

                      <div className="mb-6 flex justify-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                          {user.firstName.charAt(0)}
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {user.firstName} {user.lastName}
                      </h3>

                      <TrustScore
                        score={user.trustScore.totalScore}
                        trustLevel={user.trustScore.trustLevel}
                        size="lg"
                        showLabel={true}
                      />

                      {user.isVerified && (
                        <div className="mt-4 inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                          ✓ Verified
                        </div>
                      )}

                      <div className="mt-6 space-y-2 text-sm text-gray-600">
                        <p>
                          <span className="font-semibold">Giving Score:</span>{' '}
                          {user.trustScore.givingScore}/100
                        </p>
                        <p>
                          <span className="font-semibold">Receiving Score:</span>{' '}
                          {user.trustScore.receivingScore}/100
                        </p>
                        <p>
                          <span className="font-semibold">Feedback Score:</span>{' '}
                          {user.trustScore.feedbackScore}/100
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full Leaderboard Table */}
            <div className="card overflow-hidden">
              <h2 className="text-2xl font-bold text-gray-900 p-6 border-b border-gray-200">
                {filterLevel === 'all' ? 'Full Leaderboard' : `${filterLevel} Members`}
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-6 font-semibold text-gray-700">
                        Rank
                      </th>
                      <th className="text-left py-3 px-6 font-semibold text-gray-700">
                        User
                      </th>
                      <th className="text-center py-3 px-6 font-semibold text-gray-700">
                        Trust Score
                      </th>
                      <th className="text-center py-3 px-6 font-semibold text-gray-700">
                        Level
                      </th>
                      <th className="text-center py-3 px-6 font-semibold text-gray-700">
                        Giving
                      </th>
                      <th className="text-center py-3 px-6 font-semibold text-gray-700">
                        Receiving
                      </th>
                      <th className="text-center py-3 px-6 font-semibold text-gray-700">
                        Feedback
                      </th>
                      <th className="text-center py-3 px-6 font-semibold text-gray-700">
                        Completion
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaderboard.map((user, index) => {
                      const globalRank =
                        leaderboard.findIndex((u) => u.id === user.id) + 1;
                      return (
                        <tr
                          key={user.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold">
                                {getMedalEmoji(globalRank)}
                              </span>
                              <span className="font-semibold text-gray-900">
                                #{globalRank}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                                {user.firstName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {user.firstName} {user.lastName}
                                </p>
                                {user.isVerified && (
                                  <p className="text-xs text-blue-600">
                                    ✓ Verified
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <TrustScore
                              score={user.trustScore.totalScore}
                              size="sm"
                              showLabel={false}
                            />
                          </td>
                          <td className="py-4 px-6 text-center">
                            <TrustScoreBadge
                              trustLevel={user.trustScore.trustLevel}
                            />
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex justify-center">
                              <TrustScoreBar
                                score={user.trustScore.givingScore}
                                showPercentage={false}
                                animated={false}
                                className="w-24"
                              />
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {user.trustScore.givingScore}%
                            </p>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex justify-center">
                              <TrustScoreBar
                                score={user.trustScore.receivingScore}
                                showPercentage={false}
                                animated={false}
                                className="w-24"
                              />
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {user.trustScore.receivingScore}%
                            </p>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex justify-center">
                              <TrustScoreBar
                                score={user.trustScore.feedbackScore}
                                showPercentage={false}
                                animated={false}
                                className="w-24"
                              />
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {user.trustScore.feedbackScore}%
                            </p>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <p className="font-semibold text-gray-900">
                              {Math.round(user.trustScore.completionRate)}%
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
