'use client';

import { useEffect, useState } from 'react';
import { adminApiClient } from '@/lib/apiClient';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface BadgeAssignment {
  id: string;
  badgeId: string;
  userId: string;
  awardedAt: string;
  badge?: Badge;
  user?: { id: string; name: string; email: string };
}

interface Badge {
  id: string;
  code: string;
  name: string;
  icon: string;
  isNGO: boolean;
}

export default function BadgesAdminPage() {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<BadgeAssignment[]>([]);
  const [filterBadge, setFilterBadge] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    (async (): Promise<void> => {
      try {
        const [resAssignments, resBadges] = await Promise.all([
          adminApiClient.get('/badges/admin/assignments'),
          adminApiClient.get('/badges/definitions'),
        ]);
        setAssignments(resAssignments || []);
        setBadges(resBadges || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = assignments.filter((a: BadgeAssignment) => {
    if (filterBadge && a.badge?.code !== filterBadge) return false;
    if (filterUser && !a.user?.name?.includes(filterUser) && !a.user?.email?.includes(filterUser)) return false;
    return true;
  });

  if (loading) {
    return <div className="p-6"><LoadingSpinner /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Badge System Audit</h1>
        <p className="text-gray-600 mb-6">Track badge awards, criteria, and user achievements in real-time.</p>

        {/* Badges Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-3">Badge Definitions</h2>
            <div className="space-y-2">
              {badges.map((b: Badge) => (
                <div key={b.id} className="flex items-start p-2 hover:bg-gray-50 rounded">
                  <span className="mr-2 text-lg">{emojiForIcon(b.icon)}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{b.name}</p>
                    <p className="text-xs text-gray-500">{b.code}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${b.isNGO ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {b.isNGO ? 'NGO' : 'User'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-3">Award Statistics</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Assignments</span>
                <span className="text-2xl font-bold text-primary-600">{assignments.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Users with Badges</span>
                <span className="text-2xl font-bold text-secondary-600">
                  {new Set(assignments.filter(a => a.user).map(a => a.user?.id)).size}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">NGOs with Badges</span>
                <span className="text-2xl font-bold text-info-600">
                  {new Set(assignments.filter(a => a.ngoProfile).map(a => a.ngoProfile?.id)).size}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Revoked Badges</span>
                <span className="text-2xl font-bold text-red-600">{assignments.filter(a => a.isRevoked).length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Badge</label>
              <select
                value={filterBadge}
                onChange={(e) => setFilterBadge(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Badges</option>
                {badges.map((b: Badge) => (
                  <option key={b.id} value={b.code}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by User/Email</label>
              <input
                type="text"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                placeholder="Search name or email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr className="text-left text-xs font-semibold text-gray-700">
                  <th className="px-4 py-3">Badge</th>
                  <th className="px-4 py-3">Assigned To</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Awarded At</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      No badge assignments found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((a: BadgeAssignment) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{emojiForIcon(a.badge?.icon)}</span>
                          <span className="font-medium text-sm">{a.badge?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          {a.user ? (
                            <>
                              <p className="font-medium">{a.user.name}</p>
                              <p className="text-xs text-gray-500">{a.user.email}</p>
                            </>
                          ) : a.ngoProfile ? (
                            <>
                              <p className="font-medium">{a.ngoProfile.organizationName}</p>
                              <p className="text-xs text-gray-500">{a.ngoProfile.registrationNumber}</p>
                            </>
                          ) : (
                            '—'
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${a.user ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {a.user ? 'User' : 'NGO'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(a.awardedAt).toLocaleDateString()} {new Date(a.awardedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {a.reason || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${a.isRevoked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {a.isRevoked ? 'Revoked' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
          <p className="font-semibold mb-2">How Badges Are Awarded:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>FIRST_GIVER:</strong> When a user completes their first successful giveaway (pickup verified).</li>
            <li><strong>VERIFIED_GIVER:</strong> When a verified user completes 1+ successful gives.</li>
            <li><strong>CONSISTENT_GIVER:</strong> Auto-awarded at 10 successful giveaways.</li>
            <li><strong>VERIFIED_NGO:</strong> Auto-awarded when admin verifies an NGO.</li>
            <li><strong>COMMUNITY_HERO:</strong> Reserved for exceptional contributors (25+ gives or admin-awarded).</li>
            <li>All badges are <strong>read-only</strong> and cannot be self-claimed.</li>
            <li>Badges are logged in audit trail and tracked for transparency.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function emojiForIcon(icon: string): string {
  const map: Record<string, string> = {
    'gift-open': '🎁',
    'shield-check': '✅',
    'repeat': '🔁',
    'users': '👥',
    'heart': '❤️',
    'badge': '🏷️',
    'document-text': '📄',
    'handshake': '🤝',
    'sun': '☀️',
    'sparkles': '✨',
  };
  return map[icon] || '🔖';
}

