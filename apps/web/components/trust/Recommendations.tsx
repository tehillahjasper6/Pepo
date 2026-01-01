import React, { useEffect, useState } from 'react';
import { matchingAPI } from '@/lib/api/matching';

interface RecommendationsProps {
  userId: string;
  limit?: number;
}

const Recommendations: React.FC<RecommendationsProps> = ({ userId, limit = 10 }) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await matchingAPI.getRecommendations(userId, limit);
        setRecommendations(data);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [userId, limit]);

  if (loading) {
    return <div className="p-4 bg-gray-100 rounded-lg animate-pulse h-96" />;
  }

  if (recommendations.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">No recommendations available at this time.</p>
        <p className="text-sm text-gray-500 mt-2">Check back later for personalized suggestions!</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold mb-1">Personalized for You</h3>
        <p className="text-sm text-gray-600">Based on your interests and location</p>
      </div>

      {recommendations.map((rec, idx) => (
        <div key={rec.giveaway.id} className="bg-white rounded-lg shadow-md p-4">
          <div className="flex gap-4">
            {/* Image */}
            <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0">
              {rec.giveaway.images && rec.giveaway.images[0] && (
                <img
                  src={rec.giveaway.images[0]}
                  alt={rec.giveaway.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-sm mb-1">{rec.giveaway.title}</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {rec.giveaway.category}
                    </span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      📍 {rec.distance.toFixed(1)}km away
                    </span>
                  </div>
                </div>

                {/* Match score */}
                <div className={`rounded-lg p-2 text-center font-bold ${getScoreColor(rec.matchScore)}`}>
                  <p className="text-lg">{rec.matchScore.toFixed(0)}%</p>
                  <p className="text-xs">Match</p>
                </div>
              </div>

              {/* Giver info */}
              <div className="text-xs text-gray-600 mb-2">
                <p>
                  Giver: <strong>{rec.giveaway.giver.name}</strong>
                  <span className="ml-2">⭐ {rec.giveaway.giver.trustScore}/100</span>
                </p>
              </div>

              {/* Reasons */}
              {rec.reasons && rec.reasons.length > 0 && (
                <div className="text-xs text-gray-700 space-y-1">
                  {rec.reasons.map((reason: string, i: number) => (
                    <p key={i} className="flex items-center">
                      <span className="mr-2">✓</span> {reason}
                    </p>
                  ))}
                </div>
              )}

              {/* Participants */}
              <p className="text-xs text-gray-500 mt-2">
                {rec.giveaway.participantCount} people interested
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Recommendations;
