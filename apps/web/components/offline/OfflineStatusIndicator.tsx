'use client';

import { useState, useEffect } from 'react';
import { OfflineSyncService } from '@/lib/offline-sync.service';

/**
 * Offline Status Indicator Component
 * Shows user's online status and pending offline items
 */
export function OfflineStatusIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [stats, setStats] = useState({
    isOnline: true,
    pendingGiveaways: 0,
    pendingFeedback: 0,
    lastSyncTime: null as string | null,
    cacheSize: 'Unknown',
  });
  const [showDetails, setShowDetails] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const offlineService = new OfflineSyncService();

  useEffect(() => {
    // Check initial status
    updateStats();

    // Listen for online/offline changes
    const unsubscribe = offlineService.onOnlineStatusChange((online) => {
      setIsOnline(online);
      updateStats();
    });

    // Poll stats periodically
    const interval = setInterval(updateStats, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const updateStats = async () => {
    try {
      const newStats = await offlineService.getOfflineStats();
      setStats(newStats);
    } catch (error) {
      console.error('Failed to update offline stats:', error);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const result = await offlineService.manualSync();
      if (result.success) {
        setTimeout(updateStats, 1000);
      }
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const totalPending = stats.pendingGiveaways + stats.pendingFeedback;

  // Only show if offline or has pending items
  if (isOnline && totalPending === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Status Badge */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all ${
          isOnline
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-white' : 'bg-yellow-300'
          } animate-pulse`}
        />
        <span className="text-sm font-medium">
          {isOnline ? 'Online' : 'Offline'}
        </span>
        {totalPending > 0 && (
          <span className="ml-2 px-2 py-1 bg-white bg-opacity-30 rounded text-xs font-semibold">
            {totalPending} pending
          </span>
        )}
      </button>

      {/* Details Panel */}
      {showDetails && (
        <div className="absolute bottom-14 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 mb-2">
          {/* Status */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Connection:</span>
                <span
                  className={
                    isOnline
                      ? 'text-green-600 font-medium'
                      : 'text-red-600 font-medium'
                  }
                >
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              {stats.lastSyncTime && (
                <div className="flex justify-between">
                  <span>Last Sync:</span>
                  <span className="text-gray-700">
                    {new Date(stats.lastSyncTime).toLocaleTimeString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Cache Size:</span>
                <span className="text-gray-700">{stats.cacheSize}</span>
              </div>
            </div>
          </div>

          {/* Pending Items */}
          {totalPending > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Pending Sync</h3>
              <div className="space-y-1 text-sm text-gray-600">
                {stats.pendingGiveaways > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>{stats.pendingGiveaways} giveaway(s)</span>
                  </div>
                )}
                {stats.pendingFeedback > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>{stats.pendingFeedback} feedback submission(s)</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {totalPending > 0 && (
              <button
                onClick={handleManualSync}
                disabled={syncing || !isOnline}
                className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors"
              >
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
            )}
            <button
              onClick={() => setShowDetails(false)}
              className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>

          {/* Info */}
          {!isOnline && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
              <p className="font-semibold mb-1">You&#39;re offline</p>
              <p>
                Your changes will be saved locally and synced automatically when
                you&#39;re back online.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OfflineStatusIndicator;
