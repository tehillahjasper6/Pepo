import React, { useEffect, useState } from 'react';
import { fraudAPI } from '@/lib/api/fraud';

interface FraudStats {
  total?: number;
  pending?: number;
  reviewed?: number;
  flagged?: number;
  suspended?: number;
  avgRiskScore?: number;
  [key: string]: unknown;
}

interface PendingReview {
  id?: string | number;
  riskScore?: number;
  reason?: string;
  reportedBy?: string;
  timestamp?: string;
  flagType?: string;
  description?: string;
  user?: { 
    name?: string;
    createdAt?: string | Date;
    _count?: {
      giveaways?: number;
      interests?: number;
    };
  };
  userId?: string;
  [key: string]: unknown;
}

const FraudDetectionDashboard: React.FC = () => {
  const [stats, setStats] = useState<FraudStats | null>(null);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const [statsData, reviewsData] = await Promise.all([
          fraudAPI.getFraudStats(),
          fraudAPI.getPendingReviews(),
        ]);
        setStats(statsData);
        setPendingReviews(reviewsData);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleResolveFlag = async (flagId: string | number | undefined, action: string, resolution: string): Promise<void> => {
    if (flagId === undefined) return;
    const idString = typeof flagId === 'string' ? flagId : String(flagId);
    setResolving(idString);
    try {
      await fraudAPI.resolveFlag(idString, { action, resolution });
      // Refresh data
      const reviewsData = await fraudAPI.getPendingReviews();
      setPendingReviews(reviewsData);
    } finally {
      setResolving(null);
    }
  };

  const getRiskColor = (score: number | undefined) => {
    const numScore = score || 0;
    if (numScore >= 70) return 'bg-red-50 border-red-200';
    if (numScore >= 50) return 'bg-orange-50 border-orange-200';
    if (numScore >= 25) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const getRiskBadgeColor = (score: number | undefined) => {
    const numScore = score || 0;
    if (numScore >= 70) return 'text-white bg-red-600';
    if (numScore >= 50) return 'text-white bg-orange-600';
    if (numScore >= 25) return 'text-white bg-yellow-600';
    return 'text-white bg-green-600';
  };

  const getFlagTypeLabel = (type: string | undefined) => {
    const str = type || '';
    return str
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  if (loading) {
    return <div className="p-6 bg-gray-100 rounded-lg animate-pulse h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-600 font-semibold">Total Flags</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-600 font-semibold">Pending Review</p>
          <p className="text-3xl font-bold text-yellow-600">{stats?.pending || 0}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-600 font-semibold">Reviewed</p>
          <p className="text-3xl font-bold text-blue-600">{stats?.reviewed || 0}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-sm text-gray-600 font-semibold">Suspended</p>
          <p className="text-3xl font-bold text-red-600">{stats?.suspended || 0}</p>
        </div>
      </div>

      {/* Average Risk Score */}
      <div className="bg-white rounded-lg p-4 shadow">
        <p className="text-sm text-gray-600 font-semibold">Average Risk Score</p>
        <p className="text-4xl font-bold mt-2">{(stats?.avgRiskScore || 0).toFixed(1)}/100</p>
      </div>

      {/* Pending Reviews */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold">Pending Reviews</h3>
          <p className="text-sm text-gray-600">Cases requiring attention</p>
        </div>

        {pendingReviews.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No pending reviews</div>
        ) : (
          <div className="divide-y">
            {pendingReviews.map(flag => (
              <div key={flag.id} className={`p-4 border-l-4 ${getRiskColor(flag.riskScore)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRiskBadgeColor(flag.riskScore)}`}>
                        {flag.riskScore} pts
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700 font-semibold">
                        {getFlagTypeLabel(flag.flagType)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-2">
                      <strong>User:</strong> {flag.user?.name || flag.userId}
                    </p>

                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Description:</strong> {flag.description}
                    </p>

                    {flag.user && (
                      <div className="text-xs text-gray-600 space-y-1">
                        <p><strong>Recent Activities:</strong> {flag.user._count?.giveaways || 0} giveaways, {flag.user._count?.interests || 0} interests</p>
                        {flag.user.createdAt && (
                          <p><strong>Account Age:</strong> {Math.floor((Date.now() - new Date(flag.user.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex gap-2">
                    <button
                      onClick={() => handleResolveFlag(flag.id, 'none', 'false_positive')}
                      disabled={resolving === flag.id}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      ✓ Clear
                    </button>
                    <button
                      onClick={() => handleResolveFlag(flag.id, 'warning', 'confirmed')}
                      disabled={resolving === flag.id}
                      className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 disabled:opacity-50"
                    >
                      ⚠ Warn
                    </button>
                    <button
                      onClick={() => handleResolveFlag(flag.id, 'suspend', 'confirmed')}
                      disabled={resolving === flag.id}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      🚫 Suspend
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FraudDetectionDashboard;
