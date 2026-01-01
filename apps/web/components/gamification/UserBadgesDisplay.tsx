'use client';

import { useState, useEffect } from 'react';
import { Trophy, Target, Flame, Zap } from 'lucide-react';

/**
 * User Badges & Achievements Component
 * Displays earned badges and gamification progress
 */
export function UserBadgesDisplay({
  userId,
  displayMode = 'compact', // 'compact' | 'detailed' | 'showcase'
}: {
  userId: string;
  displayMode?: 'compact' | 'detailed' | 'showcase';
}) {
  const [stats, setStats] = useState<{ [key: string]: unknown } | null>(null);
  const [badges, setBadges] = useState<Array<{ id: string; [key: string]: unknown }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGamificationData();
  }, [userId]);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const statsRes = await fetch('/api/gamification/user/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const statsData = await statsRes.json();
      setStats(statsData.data);

      // Fetch badges
      const badgesRes = await fetch('/api/gamification/user/badges', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const badgesData = await badgesRes.json();
      setBadges(badgesData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading badges...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">Error: {error}</div>
    );
  }

  if (!stats) {
    return null;
  }

  // Compact mode - just show badges
  if (displayMode === 'compact') {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">
          Earned Badges ({badges.length})
        </p>
        <div className="flex flex-wrap gap-2">
          {badges.length === 0 ? (
            <p className="text-xs text-gray-500">No badges earned yet</p>
          ) : (
            badges.slice(0, 6).map((badge) => (
              <div
                key={badge.id}
                className="relative group"
                title={badge.description}
              >
                <div className="text-2xl cursor-help hover:scale-110 transition-transform">
                  {badge.icon}
                </div>
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-gray-900 text-white text-xs rounded whitespace-normal z-10">
                  {badge.name}: {badge.description}
                </div>
              </div>
            ))
          )}
          {badges.length > 6 && (
            <div className="text-sm font-medium text-gray-600">
              +{badges.length - 6}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Detailed mode - show stats and badges
  if (displayMode === 'detailed') {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 space-y-6">
        {/* Level & Points */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">Level</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.level}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.totalPoints} points
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Badges</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.badgesEarned}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              of {stats.totalBadgesAvailable}
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progress to Level {stats.level + 1}
            </span>
            <span className="text-xs font-semibold text-gray-600">
              {Math.round(stats.currentLevelProgress * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
              style={{
                width: `${stats.currentLevelProgress * 100}%`,
              }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {stats.nextLevelPoints} points needed
          </div>
        </div>

        {/* Streaks */}
        {stats.streaks && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-1 mb-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-medium text-gray-600">
                  Day Streak
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.streaks.currentDayStreak}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-1 mb-1">
                <Target className="w-4 h-4 text-red-500" />
                <span className="text-xs font-medium text-gray-600">
                  Best Streak
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.streaks.longestDayStreak}
              </div>
            </div>
          </div>
        )}

        {/* Badges Grid */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Earned Badges
          </h3>
          {badges.length === 0 ? (
            <p className="text-sm text-gray-500 p-4 bg-white rounded-lg text-center">
              Complete activities to earn badges!
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="group text-center"
                  title={badge.description}
                >
                  <div className="bg-white rounded-lg p-3 shadow-sm group-hover:shadow-md transition-shadow cursor-help">
                    <div className="text-3xl mb-1">{badge.icon}</div>
                    <p className="text-xs font-medium text-gray-900 line-clamp-2">
                      {badge.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      +{badge.points} pts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Showcase mode - featured display
  return (
    <div className="space-y-8">
      {/* Featured Badge */}
      {badges.length > 0 && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Latest Achievement
          </h2>
          <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-12 shadow-lg">
            <div className="text-8xl mb-4">{badges[0].icon}</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {badges[0].name}
            </h3>
            <p className="text-gray-700 mb-4">{badges[0].description}</p>
            <p className="text-sm text-gray-600">
              Earned on{' '}
              {new Date(badges[0].awardedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {stats.level}
          </div>
          <p className="text-gray-600">Current Level</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <div className="text-4xl font-bold text-purple-600 mb-2">
            {stats.badgesEarned}
          </div>
          <p className="text-gray-600">Badges Earned</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">
            {stats.totalPoints}
          </div>
          <p className="text-gray-600">Total Points</p>
        </div>
      </div>

      {/* All Badges */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">All Badges</h3>
        <div className="grid grid-cols-2 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-2">{badge.icon}</div>
              <h4 className="font-semibold text-gray-900">{badge.name}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {badge.description}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(badge.awardedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserBadgesDisplay;
