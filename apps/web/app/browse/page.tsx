'use client';

import { useState, useEffect, useCallback } from 'react';
import { GiveawayCard } from '@/components/GiveawayCard';
import { PepoBee } from '@/components/PepoBee';
import { useGiveaways } from '@/hooks/useGiveaways';
import { toast } from '@/components/Toast';

export default function BrowsePage() {
  const { giveaways, isLoading, error, pagination, fetchGiveaways, setFilters, setPage } = useGiveaways();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    // Fetch giveaways on mount and when filter/search changes
    const filterParams: any = {};
    if (filter !== 'all') {
      filterParams.category = filter;
    }
    if (debouncedSearch) {
      filterParams.search = debouncedSearch;
    }
    setFilters(filterParams);
  }, [filter, debouncedSearch, setFilters]);

  useEffect(() => {
    // Show error toast if there's an error
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-background-default">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-neutral-900">Browse Giveaways</h1>
          <p className="text-gray-600 mt-2">Discover items shared by your community</p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search giveaways..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4 overflow-x-auto">
            <FilterButton 
              active={filter === 'all'} 
              onClick={() => setFilter('all')}
            >
              All
            </FilterButton>
            <FilterButton 
              active={filter === 'Furniture'} 
              onClick={() => setFilter('Furniture')}
            >
              Furniture
            </FilterButton>
            <FilterButton 
              active={filter === 'Clothing'} 
              onClick={() => setFilter('Clothing')}
            >
              Clothing
            </FilterButton>
            <FilterButton 
              active={filter === 'Electronics'} 
              onClick={() => setFilter('Electronics')}
            >
              Electronics
            </FilterButton>
            <FilterButton 
              active={filter === 'Toys'} 
              onClick={() => setFilter('Toys')}
            >
              Toys
            </FilterButton>
            <FilterButton 
              active={filter === 'Books'} 
              onClick={() => setFilter('Books')}
            >
              Books
            </FilterButton>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <PepoBee emotion="loading" size={200} />
            <p className="mt-4 text-gray-600">Loading giveaways...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <PepoBee emotion="alert" size={200} />
            <h2 className="text-2xl font-semibold mt-8 text-gray-900">Oops! Something went wrong</h2>
            <p className="text-gray-600 mt-2 text-center max-w-md">
              {error}
            </p>
            <button onClick={() => fetchGiveaways()} className="btn btn-primary mt-6">
              Try Again
            </button>
          </div>
        ) : giveaways.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <PepoBee emotion="idle" size={250} />
            <h2 className="text-2xl font-semibold mt-8 text-gray-900">
              {filter !== 'all' ? `No ${filter} giveaways yet` : 'No giveaways yet'}
            </h2>
            <p className="text-gray-600 mt-2 text-center max-w-md">
              {filter !== 'all' 
                ? 'Try selecting a different category or be the first to share!'
                : 'Be the first to share something with your community!'}
            </p>
            <a href="/create" className="btn btn-primary mt-6">
              Post a Giveaway
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {giveaways.map((giveaway: any) => (
                <GiveawayCard key={giveaway.id} giveaway={giveaway} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center space-x-2">
                <button
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`px-4 py-2 rounded-lg ${
                    pagination.page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-4 py-2 rounded-lg ${
                          pagination.page === pageNum
                            ? 'bg-primary-500 text-white'
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={!pagination.hasMore}
                  className={`px-4 py-2 rounded-lg ${
                    !pagination.hasMore
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            )}

            {/* Results count */}
            {pagination && (
              <div className="mt-4 text-center text-gray-600 text-sm">
                Showing {giveaways.length} of {pagination.total} giveaways
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
        active
          ? 'bg-primary-500 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

