'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { PepoIcon } from '@/components/PepoBee';
import { adminApiClient } from '@/lib/apiClient';

interface TransparencyReport {
  id: string;
  [key: string]: unknown;
}

export default function TransparencyReportsPage() {
  const [reports, setReports] = useState<TransparencyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<TransparencyReport | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await adminApiClient.getPendingTransparencyReports();
      setReports(data.reports || []);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (reportId: string, action: 'APPROVE' | 'REJECT'): Promise<void> => {
    try {
      setProcessing(true);
      await adminApiClient.reviewTransparencyReport(
        reportId,
        action,
        action === 'APPROVE' ? reviewNotes : undefined,
        action === 'REJECT' ? rejectionReason : undefined
      );

      setSelectedReport(null);
      setReviewNotes('');
      setRejectionReason('');
      await fetchReports();
    } catch (error) {
      alert('Failed to review report');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-500">Loading reports...</p>
        </div>
      </div>
    );
  }

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
                <p className="text-sm text-gray-500">Transparency Reports</p>
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
              <Link href="/transparency-reports" className="text-primary-600 font-medium">
                Transparency
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
            <h2 className="text-2xl font-bold">Pending Transparency Reports</h2>
            <div className="text-sm text-gray-500">
              {reports.length} pending review
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No pending reports</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="border rounded-lg p-6 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        {report.ngoProfile?.organizationName || 'Unknown NGO'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {report.reportFrequency === 'QUARTERLY' ? 'Quarterly' : 'Annual'} Report
                      </p>
                      <p className="text-sm text-gray-500">
                        Period: {new Date(report.periodStart).toLocaleDateString()} -{' '}
                        {new Date(report.periodEnd).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Submitted: {new Date(report.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Review
                    </button>
                  </div>

                  {/* Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Campaigns</div>
                      <div className="font-medium">{report.campaignCount}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Items Distributed</div>
                      <div className="font-medium">{report.itemsDistributed}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Beneficiaries</div>
                      <div className="font-medium">{report.beneficiariesReached}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Locations</div>
                      <div className="font-medium">{report.locationsServed?.length || 0}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">Review Transparency Report</h3>
            
            <div className="space-y-6 mb-6">
              {/* Report Details */}
              <div>
                <h4 className="font-semibold mb-2">Organization</h4>
                <p className="text-gray-700">
                  {selectedReport.ngoProfile?.organizationName || 'Unknown'}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Reporting Period</h4>
                <p className="text-gray-700">
                  {new Date(selectedReport.periodStart).toLocaleDateString()} -{' '}
                  {new Date(selectedReport.periodEnd).toLocaleDateString()}
                </p>
              </div>

              {/* Campaign Summary */}
              <div>
                <h4 className="font-semibold mb-2">Campaign Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Campaigns</div>
                    <div className="font-medium">{selectedReport.campaignCount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Items Distributed</div>
                    <div className="font-medium">{selectedReport.itemsDistributed}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Beneficiaries</div>
                    <div className="font-medium">{selectedReport.beneficiariesReached}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Locations</div>
                    <div className="font-medium">{selectedReport.locationsServed?.length || 0}</div>
                  </div>
                </div>
                {selectedReport.locationsServed && selectedReport.locationsServed.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm text-gray-500 mb-1">Locations:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.locationsServed.map((loc: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm">
                          {loc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Financial Summary */}
              {(selectedReport.fundsReceivedMin || selectedReport.fundsReceivedMax) && (
                <div>
                  <h4 className="font-semibold mb-2">Financial Summary</h4>
                  <p className="text-gray-700">
                    Funds Received: {selectedReport.fundsReceivedMin && `$${selectedReport.fundsReceivedMin.toLocaleString()}`}
                    {selectedReport.fundsReceivedMax && ` - $${selectedReport.fundsReceivedMax.toLocaleString()}`}
                  </p>
                  {selectedReport.fundsUtilized && (
                    <div className="mt-2 text-sm">
                      <div>Funds Utilization:</div>
                      <pre className="bg-gray-50 p-2 rounded mt-1">
                        {JSON.stringify(selectedReport.fundsUtilized, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Success Stories */}
              {selectedReport.successStories && selectedReport.successStories.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Success Stories</h4>
                  <div className="space-y-3">
                    {selectedReport.successStories?.map((story: Record<string, unknown>, i: number) => (
                      <div key={i} className="border rounded p-3">
                        <h5 className="font-medium">{story.title}</h5>
                        <p className="text-sm text-gray-600 mt-1">{story.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Challenges & Lessons */}
              {selectedReport.challenges && (
                <div>
                  <h4 className="font-semibold mb-2">Challenges</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedReport.challenges}</p>
                </div>
              )}

              {selectedReport.lessonsLearned && (
                <div>
                  <h4 className="font-semibold mb-2">Lessons Learned</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedReport.lessonsLearned}</p>
                </div>
              )}
            </div>

            {/* Review Actions */}
            <div className="border-t pt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Review Notes (Optional)</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Add notes about this report..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Rejection Reason (Required if rejecting)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Explain why this report is being rejected..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setSelectedReport(null);
                    setReviewNotes('');
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReview(selectedReport.id, 'REJECT')}
                  disabled={processing || !rejectionReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={() => handleReview(selectedReport.id, 'APPROVE')}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

