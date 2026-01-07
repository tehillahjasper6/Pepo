'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface NGOApplication {
  id: string;
  organizationName: string;
  registrationNumber: string;
  contactEmail: string;
  contactPhone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  submittedAt: string;
  documents: {
    registration: string;
    taxExemption: string;
  };
  description: string;
  website?: string;
}

export default function NGOVerificationPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<NGOApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<NGOApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [selectedApplication, setSelectedApplication] = useState<NGOApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT' | null>(null);

  // Check admin access
  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      router.push('/');
    }
  }, [user, router]);

  // Load applications
  useEffect(() => {
    if (user?.id) {
      loadApplications();
    }
  }, [user?.id]);

  // Filter applications
  useEffect(() => {
    const filtered = applications.filter((app) =>
      filterStatus === 'all' ? true : app.status === filterStatus
    );
    setFilteredApplications(filtered);
  }, [applications, filterStatus]);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient('/admin/ngo/pending', {
        method: 'GET',
      });
      setApplications(response.applications || []);
      setError(null);
    } catch (err) {
      setError('Failed to load NGO applications');
      console.error('Error loading applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveNGO = useCallback(
    async (applicationId: string) => {
      try {
        setIsSubmittingReview(true);
        await apiClient(`/admin/ngo/${applicationId}/verify`, {
          method: 'POST',
          body: JSON.stringify({ notes: reviewNotes }),
        });

        // Update local state
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId ? { ...app, status: 'APPROVED' } : app
          )
        );

        setSelectedApplication(null);
        setReviewNotes('');
        setReviewAction(null);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to approve NGO');
        console.error('Error approving NGO:', err);
      } finally {
        setIsSubmittingReview(false);
      }
    },
    [reviewNotes]
  );

  const handleRejectNGO = useCallback(
    async (applicationId: string) => {
      if (!rejectionReason.trim()) {
        setError('Please provide a rejection reason');
        return;
      }

      try {
        setIsSubmittingReview(true);
        await apiClient(`/admin/ngo/${applicationId}/reject`, {
          method: 'POST',
          body: JSON.stringify({ reason: rejectionReason }),
        });

        // Update local state
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId ? { ...app, status: 'REJECTED' } : app
          )
        );

        setSelectedApplication(null);
        setRejectionReason('');
        setReviewAction(null);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to reject NGO');
        console.error('Error rejecting NGO:', err);
      } finally {
        setIsSubmittingReview(false);
      }
    },
    [rejectionReason]
  );

  const handleRequestInfo = useCallback(
    async (applicationId: string, requestedInfo: string) => {
      try {
        setIsSubmittingReview(true);
        await apiClient(`/admin/ngo/${applicationId}/request-info`, {
          method: 'POST',
          body: JSON.stringify({ requestedInfo }),
        });

        // Update local state
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId
              ? { ...app, status: 'UNDER_REVIEW' }
              : app
          )
        );

        setSelectedApplication(null);
        setReviewNotes('');
        setReviewAction(null);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to request info');
        console.error('Error requesting info:', err);
      } finally {
        setIsSubmittingReview(false);
      }
    },
    []
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-default">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            NGO Verification
          </h1>
          <p className="text-gray-600">
            Review and verify NGO applications
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Applications List */}
          <div className="lg:col-span-2 card">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Applications
              </h2>

              {/* Status Filter */}
              <div className="mb-6">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Applications</option>
                  <option value="PENDING">Pending</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {/* Applications List */}
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading applications...
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No applications found
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredApplications.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => setSelectedApplication(app)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                        selectedApplication?.id === app.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {app.organizationName}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {app.contactEmail}
                      </p>
                      <p className="text-xs text-gray-500">
                        Submitted:{' '}
                        {new Date(app.submittedAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Application Details Panel */}
          <div className="lg:col-span-1">
            {selectedApplication ? (
              <div className="card sticky top-24 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Application Details
                  </h3>
                </div>

                {/* Organization Info */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Organization Name
                    </p>
                    <p className="text-gray-900 font-semibold">
                      {selectedApplication.organizationName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Registration Number
                    </p>
                    <p className="text-gray-900">
                      {selectedApplication.registrationNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Contact Email
                    </p>
                    <p className="text-gray-900">{selectedApplication.contactEmail}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Contact Phone
                    </p>
                    <p className="text-gray-900">{selectedApplication.contactPhone}</p>
                  </div>

                  {selectedApplication.website && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                        Website
                      </p>
                      <a
                        href={selectedApplication.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline"
                      >
                        {selectedApplication.website}
                      </a>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Submitted
                    </p>
                    <p className="text-gray-900">
                      {new Date(selectedApplication.submittedAt).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Description
                    </p>
                    <p className="text-gray-900 text-sm">
                      {selectedApplication.description}
                    </p>
                  </div>
                </div>

                {/* Documents */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-3">
                    Documents
                  </p>
                  <div className="space-y-2">
                    <a
                      href={selectedApplication.documents.registration}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm"
                    >
                      📄 View Registration Document
                    </a>
                    <a
                      href={selectedApplication.documents.taxExemption}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm"
                    >
                      📄 View Tax Exemption Certificate
                    </a>
                  </div>
                </div>

                {/* Review Actions */}
                {selectedApplication.status === 'PENDING' ||
                selectedApplication.status === 'UNDER_REVIEW' ? (
                  <div className="border-t border-gray-200 pt-4 space-y-4">
                    {reviewAction === null ? (
                      <div className="space-y-2">
                        <button
                          onClick={() => setReviewAction('APPROVE')}
                          className="w-full px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-semibold transition-colors"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => setReviewAction('REJECT')}
                          className="w-full px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-semibold transition-colors"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    ) : reviewAction === 'APPROVE' ? (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-700">
                          Add notes (optional)
                        </p>
                        <textarea
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          placeholder="Notes for the NGO..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setReviewAction(null)}
                            className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() =>
                              handleApproveNGO(selectedApplication.id)
                            }
                            disabled={isSubmittingReview}
                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors disabled:opacity-50"
                          >
                            {isSubmittingReview ? 'Processing...' : 'Confirm'}
                          </button>
                        </div>
                      </div>
                    ) : reviewAction === 'REJECT' ? (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-700">
                          Reason for rejection (required)
                        </p>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Explain why this application is rejected..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setReviewAction(null)}
                            className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() =>
                              handleRejectNGO(selectedApplication.id)
                            }
                            disabled={isSubmittingReview || !rejectionReason.trim()}
                            className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors disabled:opacity-50"
                          >
                            {isSubmittingReview ? 'Processing...' : 'Confirm'}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-600">
                      This application has already been reviewed.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="card text-center text-gray-500 py-8">
                Select an application to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
