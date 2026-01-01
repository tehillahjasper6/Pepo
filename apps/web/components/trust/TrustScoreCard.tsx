import React, { useEffect, useState } from 'react';
import { trustAPI } from '@/lib/api/trust';

interface TrustScoreProps {
  userId: string;
}

const TrustScoreCard: React.FC<TrustScoreProps> = ({ userId }) => {
  const [trustData, setTrustData] = useState<{ id: string; [key: string]: unknown } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrustScore = async () => {
      try {
        const data = await trustAPI.getTrustScore(userId);
        setTrustData(data);
      } catch (error) {
        // Failed to fetch trust score
      } finally {
        setLoading(false);
      }
    };
    fetchTrustScore();
  }, [userId]);

  if (loading) {
    return <div className="p-4 bg-gray-100 rounded-lg animate-pulse h-48" />;
  }

  if (!trustData) {
    return <div className="p-4 bg-red-50 rounded-lg text-red-600">Unable to load trust score</div>;
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'HIGHLY_TRUSTED':
        return 'text-green-600 bg-green-50';
      case 'TRUSTED':
        return 'text-blue-600 bg-blue-50';
      case 'EMERGING':
        return 'text-yellow-600 bg-yellow-50';
      case 'NEW':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTierBadgeIcon = (tier: string) => {
    switch (tier) {
      case 'HIGHLY_TRUSTED':
        return '🌟';
      case 'TRUSTED':
        return '✓';
      case 'EMERGING':
        return '→';
      case 'NEW':
        return '●';
      default:
        return '?';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header with tier badge */}
      <div className={`rounded-lg p-4 mb-4 ${getTierColor(trustData.trustLevel)}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold opacity-75">Trust Level</p>
            <p className="text-2xl font-bold">{getTierBadgeIcon(trustData.trustLevel)} {trustData.trustLevel}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold opacity-75">Trust Score</p>
            <p className="text-4xl font-bold">{trustData.totalScore}</p>
            <p className="text-xs opacity-75">/100</p>
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 rounded p-3">
          <p className="text-xs text-gray-600 font-semibold">Giving</p>
          <p className="text-lg font-bold text-blue-600">{trustData.givingScore}</p>
        </div>
        <div className="bg-green-50 rounded p-3">
          <p className="text-xs text-gray-600 font-semibold">Receiving</p>
          <p className="text-lg font-bold text-green-600">{trustData.receivingScore}</p>
        </div>
        <div className="bg-purple-50 rounded p-3">
          <p className="text-xs text-gray-600 font-semibold">Feedback</p>
          <p className="text-lg font-bold text-purple-600">{trustData.feedbackScore}</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Completion Rate</span>
          <span className="font-semibold">{(trustData.completionRate * 100).toFixed(0)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Response Time</span>
          <span className="font-semibold">{trustData.responseTime || 'N/A'}</span>
        </div>
      </div>

      {/* Info */}
      <p className="text-xs text-gray-500 mt-4 pt-4 border-t">
        Trust scores are based on giving reliability, receiving integrity, and community feedback.
      </p>
    </div>
  );
};

export default TrustScoreCard;
