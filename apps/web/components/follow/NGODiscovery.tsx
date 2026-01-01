import React from 'react';
import { useTrendingNGOs, useSuggestedNGOs } from '@/hooks/useFollows';
import { Loader2, TrendingUp, Lightbulb } from 'lucide-react';
import { FollowButton } from './FollowButton';

interface NGODiscoveryProps {
  showTrending?: boolean;
  showSuggested?: boolean;
  className?: string;
}

/**
 * NGODiscovery Component
 * Displays trending and suggested NGOs for user discovery
 * Features: Real-time trending data, personalized suggestions, one-click follow
 */
export function NGODiscovery({
  showTrending = true,
  showSuggested = true,
  className = '',
}: NGODiscoveryProps) {
  const { data: trendingData, isLoading: trendingLoading } = useTrendingNGOs(10);
  const { data: suggestedData, isLoading: suggestedLoading } = useSuggestedNGOs(10);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Trending NGOs */}
      {showTrending && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-6 w-6 text-orange-500" />
            <h2 className="text-2xl font-bold">Trending NGOs</h2>
          </div>

          {trendingLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {trendingData?.map((ngo) => (
                <NGOCard key={ngo.id} ngo={ngo} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Suggested NGOs */}
      {showSuggested && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold">Suggested for You</h2>
          </div>

          {suggestedLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : suggestedData?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {suggestedData?.map((ngo) => (
                <NGOCard key={ngo.id} ngo={ngo} suggested reason={ngo.reason} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No suggestions available yet. Follow more NGOs to get personalized suggestions!
            </div>
          )}
        </section>
      )}
    </div>
  );
}

interface NGOCardProps {
  ngo: {
    id: string;
    name: string;
    category: string;
    followerCount: number;
    impactScore?: number;
  };
  suggested?: boolean;
  reason?: string;
}

/**
 * NGOCard Component
 * Compact card for displaying NGO information with follow button
 */
function NGOCard({ ngo, suggested = false, reason = '' }: NGOCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white">
      {/* Card Header */}
      <div className="mb-3">
        <h3 className="font-semibold text-lg text-gray-900 truncate">{ngo.name}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
            {ngo.category}
          </span>
          {suggested && (
            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
              Suggested
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-4 pb-4 border-b">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Followers</span>
          <span className="font-semibold text-gray-900">
            {(ngo.followerCount / 1000).toFixed(1)}K
          </span>
        </div>
        {ngo.impactScore !== undefined && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>Impact</span>
            <span className="font-semibold text-green-600">
              {(ngo.impactScore * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {/* Reason (for suggestions) */}
      {reason && (
        <p className="text-xs text-gray-500 mb-3 italic line-clamp-2">{reason}</p>
      )}

      {/* Follow Button */}
      <div className="flex justify-center">
        <FollowButton ngoId={ngo.id} variant="primary" size="sm" showLabel={false} />
      </div>
    </div>
  );
}
