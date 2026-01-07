'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { PepoIcon } from '@/components/PepoBee';
import { adminApiClient } from '@/lib/apiClient';

interface Report {
  id: string;
  type: string;
  status: string;
  [key: string]: unknown;
}

interface ReportPagination {
  page: number;
  limit: number;
  total: number;
  pages?: number;
  totalPages?: number;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'RESOLVED' | 'DISMISSED' | 'all'>('PENDING');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<ReportPagination | Record<string, unknown>>({});
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    fetchReports();
  }, [page, statusFilter]);

  const fetchReports = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await adminApiClient.getReports({
        page,
        limit: 20,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setReports(response.reports || []);
      setPagination(response.pagination || {});
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId: string): Promise<void> => {
    if (!resolution.trim()) {
      alert('Please provide a resolution reason');
      return;
    }

    try {
      await adminApiClient.resolveReport(reportId, resolution);
      setSelectedReport(null);
      setResolution('');
      await fetchReports();
    } catch (error) {
      alert('Failed to resolve report');
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'ABUSE':
        return '🚨';
      case 'SPAM':
        return '📧';
      case 'INAPPROPRIATE':
        return '⚠️';
      case 'SCAM':
        return '💸';
      default:
        return '📋';
    }
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
                <p className="text-sm text-gray-500">Reports & Moderation</p>
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
              <Link href="/reports" className="text-primary-600 font-medium">
                Reports
              </Link>
              <Link href="/audit" className="text-gray-600 hover:text-gray-900">
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
            <h2 className="text-2xl font-bold">Reports</h2>
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as 'PENDING' | 'RESOLVED' | 'DISMISSED' | 'all');
                  setPage(1);
                }}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Reports</option>
                <option value="PENDING">Pending</option>
                <option value="RESOLVED">Resolved</option>
                <option value="DISMISSED">Dismissed</option>
              </select>
              <div className="text-sm text-gray-500">
                Total: {typeof pagination.total === 'number' ? pagination.total : 0}
              </div>
            </div>
          </div>

          {/* Reports List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-500">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No reports found</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{getReportTypeIcon(report.type)}</span>
                          <div>
                            <h3 className="font-semibold">{report.type}</h3>
                            <p className="text-sm text-gray-500">
                              Reported by: {typeof report.reporter === 'object' && report.reporter && 'name' in report.reporter && typeof report.reporter.name === 'string' ? report.reporter.name : 'Unknown'} • {typeof report.createdAt === 'string' || typeof report.createdAt === 'number' ? new Date(report.createdAt).toLocaleDateString() : ''}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            report.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{typeof report.reason === 'string' ? report.reason : ''}</p>
                        {typeof report.entityType === 'string' && report.entityType && (
                          <p className="text-sm text-gray-500">
                            Entity: {report.entityType} {('entityId' in report && (typeof report.entityId === 'string' || typeof report.entityId === 'number')) ? `(ID: ${report.entityId})` : ''}
                          </p>
                        )}
                      </div>
                      {report.status === 'PENDING' && (
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {typeof pagination.totalPages === 'number' && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {page} of {typeof pagination.totalPages === 'number' ? pagination.totalPages : 0}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(typeof pagination.totalPages === 'number' ? pagination.totalPages : 1, p + 1))}
                    disabled={page === (typeof pagination.totalPages === 'number' ? pagination.totalPages : 0)}
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

      {/* Resolution Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Resolve Report</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Report Type: {typeof selectedReport.type === 'string' ? selectedReport.type : ''}</p>
              <p className="text-sm text-gray-600 mb-2">Reason: {typeof selectedReport.reason === 'string' ? selectedReport.reason : ''}</p>
            </div>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Enter resolution details..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              rows={4}
            />
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setSelectedReport(null);
                  setResolution('');
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolve(selectedReport.id)}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



