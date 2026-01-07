'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface AuditLog {
  id: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  userId: string;
  userName: string;
  ipAddress?: string;
  status: 'SUCCESS' | 'FAILURE';
  details?: Record<string, any>;
  createdAt: string;
}

export default function AuditLogsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [availableActions, setAvailableActions] = useState<string[]>([]);

  // Check admin access
  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      router.push('/');
    }
  }, [user, router]);

  // Load audit logs
  useEffect(() => {
    if (user?.id) {
      loadAuditLogs();
    }
  }, [user?.id]);

  // Apply filters
  useEffect(() => {
    let filtered = logs;

    // Action filter
    if (filterAction !== 'all') {
      filtered = filtered.filter((log) => log.action === filterAction);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((log) => log.status === filterStatus);
    }

    // User filter
    if (filterUser) {
      filtered = filtered.filter((log) =>
        log.userName.toLowerCase().includes(filterUser.toLowerCase())
      );
    }

    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(
        (log) => new Date(log.createdAt) >= fromDate
      );
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (log) => new Date(log.createdAt) <= toDate
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.resourceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [logs, filterAction, filterStatus, filterUser, dateFrom, dateTo, searchTerm]);

  const loadAuditLogs = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient('/admin/audit-logs', {
        method: 'GET',
      });
      setLogs(response.logs || []);

      // Extract unique actions for filter dropdown
      const uniqueActions = [
        ...new Set(response.logs?.map((log: AuditLog) => log.action) || []),
      ] as string[];
      setAvailableActions(uniqueActions.sort());

      setError(null);
    } catch (err) {
      setError('Failed to load audit logs');
      console.error('Error loading audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportLogs = useCallback(() => {
    // Convert filtered logs to CSV
    const headers = [
      'Date',
      'Action',
      'Resource Type',
      'User',
      'Status',
      'IP Address',
    ];
    const rows = filteredLogs.map((log) => [
      new Date(log.createdAt).toLocaleString(),
      log.action,
      log.resourceType,
      log.userName,
      log.status,
      log.ipAddress || '-',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Download as file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, [filteredLogs]);

  const clearFilters = useCallback(() => {
    setFilterAction('all');
    setFilterStatus('all');
    setFilterUser('');
    setDateFrom('');
    setDateTo('');
    setSearchTerm('');
  }, []);

  const getActionColor = (action: string) => {
    if (action.includes('CREATE') || action.includes('REGISTER'))
      return 'bg-green-100 text-green-700';
    if (action.includes('UPDATE') || action.includes('MODIFY'))
      return 'bg-blue-100 text-blue-700';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-700';
    if (action.includes('APPROVE') || action.includes('VERIFY'))
      return 'bg-purple-100 text-purple-700';
    if (action.includes('REJECT') || action.includes('DENY'))
      return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-default">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Audit Logs
            </h1>
            <p className="text-gray-600">
              Track all system actions and user activities
            </p>
          </div>
          <button
            onClick={handleExportLogs}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-semibold transition-colors"
          >
            📥 Export as CSV
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Panel */}
          <div className="card h-fit lg:col-span-1">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Filters</h2>

            <div className="space-y-4">
              {/* Search */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Action, type, user..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>

              {/* Action Filter */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                  Action
                </label>
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="all">All Actions</option>
                  {availableActions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="SUCCESS">Success</option>
                  <option value="FAILURE">Failure</option>
                </select>
              </div>

              {/* User Filter */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                  User
                </label>
                <input
                  type="text"
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  placeholder="Filter by user..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>

              {/* Date Range */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full px-3 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg font-semibold transition-colors text-sm"
              >
                Clear Filters
              </button>
            </div>

            {/* Log Count */}
            <div className="border-t border-gray-200 mt-4 pt-4">
              <p className="text-sm text-gray-600">
                Showing <span className="font-bold">{filteredLogs.length}</span>{' '}
                of <span className="font-bold">{logs.length}</span> logs
              </p>
            </div>
          </div>

          {/* Logs List */}
          <div className="lg:col-span-3">
            {/* Logs Table */}
            {isLoading ? (
              <div className="card text-center py-8 text-gray-500">
                Loading audit logs...
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="card text-center py-8 text-gray-500">
                No audit logs found
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <button
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`w-full card p-4 text-left border-2 transition-colors ${
                      selectedLog?.id === log.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${getActionColor(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                          <span className="text-xs text-gray-600">
                            {log.resourceType}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              log.status === 'SUCCESS'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {log.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 font-semibold mb-1">
                          {log.userName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                          {log.ipAddress && ` • IP: ${log.ipAddress}`}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-900">
                  Log Details
                </h2>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-500 hover:text-gray-700 font-bold text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Action
                    </p>
                    <p className="text-gray-900 font-semibold">
                      {selectedLog.action}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Status
                    </p>
                    <p
                      className={`font-semibold ${
                        selectedLog.status === 'SUCCESS'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {selectedLog.status}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      User
                    </p>
                    <p className="text-gray-900">{selectedLog.userName}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Resource Type
                    </p>
                    <p className="text-gray-900">{selectedLog.resourceType}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Timestamp
                    </p>
                    <p className="text-gray-900">
                      {new Date(selectedLog.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {selectedLog.ipAddress && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                        IP Address
                      </p>
                      <p className="text-gray-900">{selectedLog.ipAddress}</p>
                    </div>
                  )}

                  {selectedLog.resourceId && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                        Resource ID
                      </p>
                      <p className="text-gray-900 text-xs font-mono">
                        {selectedLog.resourceId}
                      </p>
                    </div>
                  )}
                </div>

                {selectedLog.details && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                      Details
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-xs text-gray-900 font-mono">
                        {JSON.stringify(selectedLog.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
