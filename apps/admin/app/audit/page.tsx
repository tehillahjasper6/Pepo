'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { PepoIcon } from '@/components/PepoBee';
import { adminApiClient } from '@/lib/apiClient';

interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userId: string;
  timestamp: string;
  details?: Record<string, unknown>;
  user?: { id: string; name: string; email: string };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    entityType: '',
    action: '',
    startDate: '',
    endDate: '',
  });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 50, total: 0, pages: 1 });

  const fetchLogs = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await adminApiClient.getAuditLogs({
        page,
        limit: 50,
        entityType: filters.entityType || undefined,
        action: filters.action || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      setLogs(response.logs || []);
      // Defensive: fallback to default PaginationInfo if missing
      setPagination({
        page: typeof response.pagination?.page === 'number' ? response.pagination.page : 1,
        limit: typeof response.pagination?.limit === 'number' ? response.pagination.limit : 50,
        total: typeof response.pagination?.total === 'number' ? response.pagination.total : (Array.isArray(response.logs) ? response.logs.length : 0),
        pages: typeof response.pagination?.pages === 'number' ? response.pagination.pages : 1,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const getActionIcon = (action: string) => {
    if (action.includes('CREATE')) return '➕';
    if (action.includes('UPDATE')) return '✏️';
    if (action.includes('DELETE')) return '🗑️';
    if (action.includes('DRAW')) return '🎲';
    if (action.includes('VERIFY')) return '✅';
    if (action.includes('REJECT')) return '❌';
    return '📋';
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-green-100 text-green-700';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-700';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-700';
    if (action.includes('DRAW')) return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <PepoIcon size={40} />
              <div>
                <h1 className="text-xl font-bold">PEPO Admin</h1>
                <p className="text-sm text-gray-500">Audit Logs</p>
              </div>
            </div>
            
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/users" className="text-gray-600 hover:text-gray-900">
                Users
              </Link>
              <Link href="/ngo-review" className="text-gray-600 hover:text-gray-900">
                NGOs
              </Link>
              <Link href="/reports" className="text-gray-600 hover:text-gray-900">
                Reports
              </Link>
              <Link href="/audit" className="text-primary-600 font-medium">
                Audit Logs
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Audit Logs</h2>
            <div className="text-sm text-gray-500">
              Total: {pagination.total}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <select
              value={filters.entityType}
              onChange={(e) => {
                setFilters({ ...filters, entityType: e.target.value });
                setPage(1);
              }}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Entity Types</option>
              <option value="User">User</option>
              <option value="Giveaway">Giveaway</option>
              <option value="NGO">NGO</option>
              <option value="Draw">Draw</option>
              <option value="Message">Message</option>
            </select>
            <select
              value={filters.action}
              onChange={(e) => {
                setFilters({ ...filters, action: e.target.value });
                setPage(1);
              }}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="DRAW">Draw</option>
              <option value="VERIFY">Verify</option>
              <option value="REJECT">Reject</option>
            </select>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => {
                setFilters({ ...filters, startDate: e.target.value });
                setPage(1);
              }}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => {
                setFilters({ ...filters, endDate: e.target.value });
                setPage(1);
              }}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="End Date"
            />
          </div>

          <div className="mb-4">
            <button
              onClick={() => {
                setFilters({
                  entityType: '',
                  action: '',
                  startDate: '',
                  endDate: '',
                });
                setPage(1);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              Clear Filters
            </button>
          </div>

          {/* Logs Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-500">Loading audit logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No audit logs found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getActionIcon(log.action)}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getActionColor(log.action)}`}>
                              {log.action}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div>
                            <div className="font-medium">{log.entityType}</div>
                            {log.entityId && (
                              <div className="text-xs text-gray-500">ID: {log.entityId}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {log.user && log.user.name ? log.user.name : log.userId || 'System'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {log.details ? (
                            <details className="cursor-pointer">
                              <summary className="text-primary-600 hover:text-primary-700">View</summary>
                              <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-w-md">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}



