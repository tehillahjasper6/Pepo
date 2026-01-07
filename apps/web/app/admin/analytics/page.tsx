'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';

// Types from analytics service
interface DashboardMetrics {
  totalPageViews: number;
  uniqueVisitors: number;
  totalActions: number;
  totalConversions: number;
  conversionRate: number;
  averageSessionDuration: number;
  topPages: Array<{ page: string; views: number }>;
  topActions: Array<{ action: string; count: number }>;
}

interface FunnelData {
  step: number;
  name: string;
  count: number;
  conversionRate: number;
}

interface RetentionMetrics {
  day7Retention: number;
  day30Retention: number;
  dayRetention: Array<{ day: number; retention: number }>;
}

export default function AnalyticsDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [funnels, setFunnels] = useState<Record<string, FunnelData[]>>({});
  const [retention, setRetention] = useState<RetentionMetrics | null>(null);
  const [selectedFunnel, setSelectedFunnel] = useState<string>('signup');

  // Fetch all analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');

        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch dashboard metrics
        const metricsRes = await fetch('/api/analytics/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!metricsRes.ok) throw new Error('Failed to fetch metrics');
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);

        // Fetch retention metrics
        const retentionRes = await fetch('/api/analytics/retention', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!retentionRes.ok) throw new Error('Failed to fetch retention');
        const retentionData = await retentionRes.json();
        setRetention(retentionData);

        // Fetch funnels
        const funnelNames = ['signup', 'giveaway_creation', 'participation'];
        const funnelPromises = funnelNames.map(async (name) => {
          const res = await fetch(`/api/analytics/funnel/${name}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            return { name, data: data.data };
          }
          return { name, data: [] };
        });

        const funnelResults = await Promise.all(funnelPromises);
        const funnelMap: Record<string, FunnelData[]> = {};
        funnelResults.forEach(({ name, data }) => {
          funnelMap[name] = data;
        });
        setFunnels(funnelMap);

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [router]);

  if (isLoading) {
    return <Loading message="Loading analytics dashboard..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-bold mb-2">Error Loading Analytics</h2>
            <p className="text-red-700">{error}</p>
            <Link
              href="/admin"
              className="mt-4 inline-block text-red-600 hover:text-red-700 underline"
            >
              Back to Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track platform usage, conversions, and user retention</p>
          <Link
            href="/admin"
            className="text-indigo-600 hover:text-indigo-700 underline mt-2"
          >
            ← Back to Admin
          </Link>
        </div>

        {/* Key Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm font-medium">Total Page Views</div>
              <div className="text-4xl font-bold text-indigo-600 mt-2">
                {metrics.totalPageViews.toLocaleString()}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm font-medium">Unique Visitors</div>
              <div className="text-4xl font-bold text-blue-600 mt-2">
                {metrics.uniqueVisitors.toLocaleString()}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm font-medium">Conversions</div>
              <div className="text-4xl font-bold text-green-600 mt-2">
                {metrics.totalConversions.toLocaleString()}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm font-medium">Conversion Rate</div>
              <div className="text-4xl font-bold text-purple-600 mt-2">
                {(metrics.conversionRate * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        )}

        {/* Top Pages and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Pages */}
          {metrics && metrics.topPages.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Top Pages</h2>
              <div className="space-y-4">
                {metrics.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm mr-3">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{page.page}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {page.views.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">views</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Actions */}
          {metrics && metrics.topActions.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Top User Actions</h2>
              <div className="space-y-4">
                {metrics.topActions.map((action, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm mr-3">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 capitalize">{action.action.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {action.count.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">events</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Funnel Analysis */}
        {Object.keys(funnels).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Funnel Analysis</h2>
              <div className="flex gap-2">
                {['signup', 'giveaway_creation', 'participation'].map((name) => (
                  <button
                    key={name}
                    onClick={() => setSelectedFunnel(name)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedFunnel === name
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {name.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {funnels[selectedFunnel] && funnels[selectedFunnel].length > 0 ? (
              <div className="space-y-4">
                {funnels[selectedFunnel].map((step, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium text-gray-900">
                          Step {step.step}: {step.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {step.count.toLocaleString()} users
                          {index > 0 && ` (${(step.conversionRate * 100).toFixed(1)}% conversion)`}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{
                          width: `${Math.max(step.conversionRate * 100, 5)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No data available for this funnel</p>
            )}
          </div>
        )}

        {/* Retention */}
        {retention && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">User Retention</h2>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-gray-600 text-sm font-medium">7-Day Retention</div>
                <div className="text-3xl font-bold text-green-600 mt-2">
                  {(retention.day7Retention * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-gray-600 text-sm font-medium">30-Day Retention</div>
                <div className="text-3xl font-bold text-blue-600 mt-2">
                  {(retention.day30Retention * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {retention.dayRetention && retention.dayRetention.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-3">Retention by Day</div>
                <div className="space-y-2">
                  {retention.dayRetention.slice(0, 7).map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-12 text-sm text-gray-600">Day {item.day}</div>
                      <div className="flex-1 ml-2">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full"
                            style={{ width: `${item.retention * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-12 text-right text-sm font-medium text-gray-700">
                        {(item.retention * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
