'use client';

import { useState, useEffect } from 'react';
import { adminApiClient } from '@/lib/apiClient';
import { PepoBee } from '@/components/PepoBee';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from '@/components/Toast';

export interface NGOApplication {
  id: string;
  ngoProfileId: string;
  organizationName: string;
  status: string;
  organizationType?: string;
  createdAt?: string;
  documents: Document[];
  reviews?: ReviewRecord[];
  registrationNumber?: string;
  country?: string;
  city?: string;
  yearEstablished?: number;
  officialEmail?: string;
  officialPhone?: string;
  address?: string;
  contactName?: string;
  contactRole?: string;
  contactEmail?: string;
  contactPhone?: string;
  riskFlags?: string[];
  [key: string]: unknown;
}

interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  documentType: string;
}

interface ReviewRecord {
  id: string;
  reviewer?: { name?: string };
  reviewedAt?: string;
  status?: string;
  notes?: string;
  [key: string]: unknown;
}

export default function NGOReviewPage() {
  const [applications, setApplications] = useState<NGOApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<NGOApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [requestInfo, setRequestInfo] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchPendingApplications();
  }, []);

  const fetchPendingApplications = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await adminApiClient.getPendingNGOs();
      setApplications(Array.isArray(data.ngos) ? data.ngos : []);
    } finally {
      setLoading(false);
    }
  };

  // Remove unused ngoProfileId parameter from fetchApplicationDetails
  const fetchApplicationDetails = async (id: string): Promise<void> => {
    try {
      const details = await adminApiClient.getNGOApplication(id);
      setSelectedApp(details);
    } catch (error) {
      toast.error('Failed to load application details');
    }
  };

  const handleApprove = async (ngoProfileId: string): Promise<void> => {
    if (!confirm('Are you sure you want to approve this NGO?')) {
      return;
    }

    try {
      setActionLoading(true);
      await adminApiClient.verifyNGO(ngoProfileId);
      toast.success('NGO approved successfully!');
      await fetchPendingApplications();
      setSelectedApp(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to approve NGO';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (ngoProfileId: string): Promise<void> => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    if (!confirm('Are you sure you want to reject this application?')) {
      return;
    }

    try {
      setActionLoading(true);
      await adminApiClient.rejectNGO(ngoProfileId, rejectReason);
      toast.success('Application rejected');
      await fetchPendingApplications();
      setSelectedApp(null);
      setRejectReason('');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to reject application';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestInfo = async (ngoProfileId: string): Promise<void> => {
    if (!requestInfo.trim()) {
      toast.error('Please specify what information is needed');
      return;
    }

    try {
      setActionLoading(true);
      await adminApiClient.requestNGOInfo(ngoProfileId, requestInfo);
      toast.success('Information request sent');
      setRequestInfo('');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send request';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-default flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-default p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">NGO Verification Dashboard</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Applications List */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">
                Pending Applications ({applications.length})
              </h2>

              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <PepoBee emotion="idle" size={100} />
                  <p className="text-gray-600 mt-4">No pending applications</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {applications.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => fetchApplicationDetails(app.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        selectedApp?.id === app.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <p className="font-semibold">{app.organizationName}</p>
                      <p className="text-sm text-gray-600">{app.organizationType ?? ''}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : ''}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Application Details */}
          <div className="lg:col-span-2">
            {selectedApp ? (
              <div className="card space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedApp.organizationName}</h2>
                    <p className="text-gray-600">{selectedApp.organizationType}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    {selectedApp.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Risk Flags */}
                {selectedApp.riskFlags && Array.isArray(selectedApp.riskFlags) && selectedApp.riskFlags.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-red-600 mb-2">Risk Flags:</p>
                    <ul className="list-disc list-inside text-sm text-red-700">
                      {selectedApp.riskFlags.map((flag: string, idx: number) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Organization Details */}
                <div>
                  <h3 className="font-semibold mb-3">Organization Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Registration Number</p>
                      <p className="font-medium">{selectedApp.registrationNumber ?? ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Country</p>
                      <p className="font-medium">{selectedApp.country ?? ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">City</p>
                      <p className="font-medium">{selectedApp.city ?? ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Year Established</p>
                      <p className="font-medium">{selectedApp.yearEstablished ?? 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Official Email</p>
                      <p className="font-medium">{selectedApp.officialEmail ?? ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Official Phone</p>
                      <p className="font-medium">{selectedApp.officialPhone ?? ''}</p>
                    </div>
                    {selectedApp.address && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium">{selectedApp.address ?? ''}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Person */}
                <div>
                  <h3 className="font-semibold mb-3">Primary Contact</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{selectedApp.contactName ?? ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Role</p>
                      <p className="font-medium">{selectedApp.contactRole ?? ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedApp.contactEmail ?? ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{selectedApp.contactPhone ?? ''}</p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                {selectedApp.documents && selectedApp.documents.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Documents</h3>
                    <div className="space-y-2">
                      {selectedApp.documents?.map((doc: Document) => (
                        <a
                          key={doc.id}
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                        >
                          <div>
                            <p className="font-medium">{doc.fileName}</p>
                            <p className="text-sm text-gray-600">{doc.documentType}</p>
                          </div>
                          <span className="text-primary-600">View →</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review History */}
                {selectedApp.reviews && selectedApp.reviews.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Review History</h3>
                    <div className="space-y-2">
                      {selectedApp.reviews?.map((review: ReviewRecord) => (
                        <div key={review.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              {review.reviewer && typeof review.reviewer === 'object' && review.reviewer.name ? (
                                <p className="font-medium">{review.reviewer.name}</p>
                              ) : null}
                              <p className="text-xs text-gray-500">
                                {review.reviewedAt ? new Date(review.reviewedAt).toLocaleString() : ''}
                              </p>
                              <p className="text-xs text-gray-500">
                                {review.status ?? ''}
                              </p>
                            </div>
                          </div>
                          {review.notes && typeof review.notes === 'string' && (
                            <p className="text-sm text-gray-700 mt-2">{review.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="border-t pt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason (if rejecting)
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Provide specific reason for rejection..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Request Additional Information
                    </label>
                    <textarea
                      value={requestInfo}
                      onChange={(e) => setRequestInfo(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Specify what information is needed..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(selectedApp.id)}
                      disabled={actionLoading}
                      className="btn bg-green-600 text-white hover:bg-green-700 flex-1"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedApp.id)}
                      disabled={actionLoading || !rejectReason.trim()}
                      className="btn bg-red-600 text-white hover:bg-red-700 flex-1"
                    >
                      ✗ Reject
                    </button>
                    <button
                      onClick={() => handleRequestInfo(selectedApp.id)}
                      disabled={actionLoading || !requestInfo.trim()}
                      className="btn btn-secondary"
                    >
                      Request Info
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <PepoBee emotion="idle" size={150} />
                <p className="text-gray-600 mt-4">Select an application to review</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}




