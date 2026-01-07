import React, { useState, useEffect } from 'react';
import { useMyFollows } from '@/hooks/useFollows';
import { Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { FollowButton } from './FollowButton';

interface MyFollowsProps {
  className?: string;
  itemsPerPage?: number;
  showFilters?: boolean;
}

/**
 * MyFollows Component
 * Displays user's followed NGOs with pagination, search, and filtering
 * Features: Real-time updates, category filtering, sorting options
 */
export function MyFollows({
  className = '',
  itemsPerPage = 20,
  showFilters = true,
}: MyFollowsProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState(search);
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState<'followedAt' | 'name' | 'impactScore'>('followedAt');

  const { data, isLoading, error } = useMyFollows(page, itemsPerPage, {
    search,
    category,
    sortBy,
  });

  if (isLoading && !data) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <p className="text-red-700 font-semibold">Error loading follows</p>
        <p className="text-red-600 text-sm">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-gray-500 text-lg">No NGOs followed yet</p>
        <p className="text-gray-400 text-sm mt-2">Discover and follow NGOs to get started</p>
      </div>
    );
  }

  const { data: follows, pagination } = data;

  // Debounce search term updates
  useEffect(() => {
    const id = setTimeout(() => {
      if (searchTerm !== search) {
        setSearch(searchTerm);
        setPage(1);
      }
    }, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Follows ({pagination.total})</h2>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              aria-label="Search NGOs"
              placeholder="Search NGOs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            aria-label="Filter by category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="health">Health</option>
            <option value="education">Education</option>
            <option value="environment">Environment</option>
            <option value="poverty">Poverty Relief</option>
            <option value="other">Other</option>
          </select>

          {/* Sort */}
          <select
            aria-label="Sort follows"
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as 'followedAt' | 'name' | 'impactScore')
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="followedAt">Recently Followed</option>
            <option value="name">Name (A-Z)</option>
            <option value="impactScore">Impact Score</option>
          </select>
        </div>
      )}

      {/* NGO List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {follows.map((follow) => (
          <div key={follow.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">
                  {follow.ngo.organizationName}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  {follow.ngo.category && (
                    <>
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {follow.ngo.category}
                      </span>
                    </>
                  )}
                </div>
              </div>
              {follow.ngo.impactScore && (
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-600">
                    {(follow.ngo.impactScore * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">Impact</div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4 pb-4 border-b">
              <span>{follow.ngo.followerCount?.toLocaleString() || 0} followers</span>
              <span className="text-xs">
                Followed {new Date(follow.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Unfollow Button */}
            <div className="flex justify-center">
              <FollowButton ngoId={follow.ngoId} variant="outline" size="sm" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between py-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </div>

          <button
            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
            disabled={page === pagination.pages}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
