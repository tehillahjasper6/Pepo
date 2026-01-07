'use client';

import React from 'react';

interface TrustScoreProps {
  score: number;
  trustLevel?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

/**
 * TrustScore Display Component
 * Shows trust score with visual indicators
 */
export const TrustScore: React.FC<TrustScoreProps> = ({
  score = 0,
  trustLevel = 'No Rating',
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  // Ensure score is between 0-100
  const normalizedScore = Math.min(Math.max(score, 0), 100);

  // Determine color based on score
  const getScoreColor = (s: number) => {
    if (s >= 90) return 'text-green-600';
    if (s >= 75) return 'text-blue-600';
    if (s >= 60) return 'text-yellow-600';
    if (s >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getBgColor = (s: number) => {
    if (s >= 90) return 'bg-green-100';
    if (s >= 75) return 'bg-blue-100';
    if (s >= 60) return 'bg-yellow-100';
    if (s >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-24 h-24 text-lg',
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Circular Score */}
      <div
        className={`
          flex items-center justify-center rounded-full font-bold
          ${sizeClasses[size]} ${getBgColor(normalizedScore)} ${getScoreColor(normalizedScore)}
          border-2 border-current
        `}
      >
        {normalizedScore}
      </div>

      {showLabel && (
        <div className="text-center">
          <p className={`font-semibold ${getScoreColor(normalizedScore)}`}>
            {trustLevel}
          </p>
          <p className="text-xs text-gray-600">Trust Score</p>
        </div>
      )}
    </div>
  );
};


// TrustScoreBar implementation
export const TrustScoreBar: React.FC<TrustScoreBarProps> = ({ score, showPercentage = true, animated = false, className = '' }) => {
  // Ensure score is between 0-100
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const getBarColor = (s: number) => {
    if (s >= 90) return 'bg-green-500';
    if (s >= 75) return 'bg-blue-500';
    if (s >= 60) return 'bg-yellow-500';
    if (s >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };
  return (
    <div className={`w-full flex flex-col gap-1 ${className}`}>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getBarColor(normalizedScore)} transition-all ${animated ? 'duration-500' : ''}`}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
      {showPercentage && (
        <span className="text-xs font-bold text-gray-900 text-right">{normalizedScore}%</span>
      )}
    </div>
  );
};

interface TrustScoreBarProps {
  score: number;
  showPercentage?: boolean;
  animated?: boolean;
  className?: string;
}

/**
 * Trust Score Progress Bar Component
      return (
        <div
          className={`flex flex-col items-center justify-center rounded-full shadow ${getBgColor(normalizedScore)} ${sizeClasses[size]} ${className}`}
          role="meter"
          aria-label={`Trust score: ${normalizedScore} (${trustLevel})`}
          aria-valuenow={normalizedScore}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span className={`font-bold ${getScoreColor(normalizedScore)} text-center`}>{normalizedScore}</span>
          {showLabel && (
            <span className="text-xs text-gray-500 mt-1">{trustLevel}</span>
          )}
        </div>
        {showPercentage && (
          <span className="text-sm font-bold text-gray-900">
            {normalizedScore}%
          </span>
        )}
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getBarColor(normalizedScore)} transition-all ${
            animated ? 'duration-500' : ''
          }`}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
    </div>
  );
};

interface TrustScoreBreakdownProps {
  givingScore?: number;
  receivingScore?: number;
  feedbackScore?: number;
  completionRate?: number;
  className?: string;
}

/**
 * Trust Score Breakdown Component
 * Shows component scores
 */
export const TrustScoreBreakdown: React.FC<TrustScoreBreakdownProps> = ({
  givingScore = 0,
  receivingScore = 0,
  feedbackScore = 0,
  completionRate = 0,
  className = '',
}) => {
  const scores = [
    { label: 'Giving Score', value: givingScore, icon: '🎁' },
    { label: 'Receiving Score', value: receivingScore, icon: '📦' },
    { label: 'Feedback Score', value: feedbackScore, icon: '⭐' },
    { label: 'Completion Rate', value: completionRate, icon: '✓' },
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="font-semibold text-gray-900">Score Breakdown</h3>
      <div className="grid grid-cols-2 gap-3">
        {scores.map((score) => (
          <div
            key={score.label}
            className="bg-gray-50 rounded-lg p-3 border border-gray-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{score.icon}</span>
              <span className="text-xs font-semibold text-gray-600 uppercase">
                {score.label}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">
                {score.value}
              </span>
              <span className="text-xs text-gray-500">/100</span>
            </div>
            <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500"
                style={{ width: `${Math.min(score.value, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface TrustScoreBadgeProps {
  trustLevel: string;
  className?: string;
}

/**
 * Trust Score Badge Component
 * Shows trust level as a badge
 */
export const TrustScoreBadge: React.FC<TrustScoreBadgeProps> = ({
  trustLevel = 'NEW',
  className = '',
}) => {
  const getBadgeStyles = (level: string) => {
    switch (level) {
      case 'HIGHLY_TRUSTED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'TRUSTED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'EMERGING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'NEW':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      HIGHLY_TRUSTED: '⭐ Highly Trusted',
      TRUSTED: '✓ Trusted',
      EMERGING: '→ Emerging',
      NEW: 'New Member',
    };
    return labels[level] || level;
  };

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold
        border ${getBadgeStyles(trustLevel)} ${className}
      `}
    >
      {getLevelLabel(trustLevel)}
    </span>
  );
};

/**
 * Trust Score Modal/Card Component
 * Shows detailed trust information
 */
interface TrustScoreDetailProps {
  userId: string;
  userName: string;
  score: number;
  trustLevel: string;
  verificationStatus: boolean;
  completedGiveaways: number;
  participations: number;
  averageRating: number;
  joinDate: string;
  className?: string;
}

export const TrustScoreDetail: React.FC<TrustScoreDetailProps> = ({
  userId,
  userName,
  score,
  trustLevel,
  verificationStatus,
  completedGiveaways,
  participations,
  averageRating,
  joinDate,
  className = '',
}) => {
  const daysSinceJoin = Math.floor(
    (Date.now() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{userName}</h3>
          <p className="text-sm text-gray-600">User ID: {userId.slice(0, 8)}...</p>
        </div>
        <TrustScore score={score} trustLevel={trustLevel} size="lg" />
      </div>

      {/* Verification Status */}
      <div className="mb-6 p-3 rounded-lg bg-blue-50 border border-blue-200">
        <p className="text-sm">
          <span className="font-semibold text-gray-900">Verification Status: </span>
          <span
            className={
              verificationStatus ? 'text-green-600 font-semibold' : 'text-gray-600'
            }
          >
            {verificationStatus ? '✓ Verified' : 'Not Verified'}
          </span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
            Giveaways Created
          </p>
          <p className="text-2xl font-bold text-gray-900">{completedGiveaways}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
            Participations
          </p>
          <p className="text-2xl font-bold text-gray-900">{participations}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
            Average Rating
          </p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-gray-900">
              {(averageRating / 20).toFixed(1)}
            </p>
            <span className="text-sm text-gray-600">/5</span>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
            Member Since
          </p>
          <p className="text-2xl font-bold text-gray-900">{daysSinceJoin}d</p>
        </div>
      </div>

      {/* Trust Score Bar */}
      <TrustScoreBar score={score} />
    </div>
  );
};
