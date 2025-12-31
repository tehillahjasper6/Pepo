'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/apiClient';
import { PepoBee } from '@/components/PepoBee';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function NGOStatusPage() {
  const { user, isAuthenticated } = useAuth();
  const [ngoProfile, setNgoProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNGOProfile();
    }
  }, [isAuthenticated]);

  const fetchNGOProfile = async () => {
    try {
      const profile = await apiClient.getNGOProfile();
      setNgoProfile(profile);
    } catch (error) {
      console.error('Failed to fetch NGO profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-default flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!ngoProfile) {
    return (
      <div className="min-h-screen bg-background-default">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="card text-center">
            <PepoBee emotion="idle" size={150} />
            <h1 className="text-2xl font-bold mt-6 mb-4">No NGO Application Found</h1>
            <p className="text-gray-600 mb-6">
              You haven't applied for NGO status yet. Start your application to get verified.
            </p>
            <a href="/ngo/register" className="btn btn-primary">
              Apply Now
            </a>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800';
      case 'PENDING_VERIFICATION':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'SUSPENDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'Your organization has been verified! You can now create campaigns.';
      case 'PENDING_VERIFICATION':
        return 'Your application is under review. We typically review applications within 2-3 business days.';
      case 'REJECTED':
        return ngoProfile.rejectionReason
          ? `Your application was not approved. Reason: ${ngoProfile.rejectionReason}`
          : 'Your application was not approved. Please review and re-apply.';
      case 'SUSPENDED':
        return 'Your NGO account has been suspended. Please contact support.';
      default:
        return 'Unknown status';
    }
  };

  return (
    <div className="min-h-screen bg-background-default">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">NGO Application Status</h1>

        {/* Status Card */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{ngoProfile.organizationName}</h2>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                ngoProfile.status,
              )}`}
            >
              {ngoProfile.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center justify-center py-8">
            {ngoProfile.status === 'VERIFIED' ? (
              <PepoBee emotion="celebrate" size={120} />
            ) : ngoProfile.status === 'PENDING_VERIFICATION' ? (
              <PepoBee emotion="loading" size={120} />
            ) : (
              <PepoBee emotion="alert" size={120} />
            )}
          </div>

          <p className="text-center text-gray-700 mb-6">{getStatusMessage(ngoProfile.status)}</p>

          {ngoProfile.status === 'PENDING_VERIFICATION' && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>What happens next?</strong>
                <br />
                Our team will review your application and documents. You'll receive a notification
                once the review is complete.
              </p>
            </div>
          )}

          {ngoProfile.status === 'REJECTED' && (
            <div className="mt-4">
              <a href="/ngo/register" className="btn btn-primary">
                Re-apply with Updated Information
              </a>
            </div>
          )}
        </div>

        {/* Application Details */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Application Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Organization Type</p>
              <p className="font-medium">{ngoProfile.organizationType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Registration Number</p>
              <p className="font-medium">{ngoProfile.registrationNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Country</p>
              <p className="font-medium">{ngoProfile.country}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">City</p>
              <p className="font-medium">{ngoProfile.city}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Application Date</p>
              <p className="font-medium">
                {new Date(ngoProfile.createdAt).toLocaleDateString()}
              </p>
            </div>
            {ngoProfile.verifiedAt && (
              <div>
                <p className="text-sm text-gray-600">Verified Date</p>
                <p className="font-medium">
                  {new Date(ngoProfile.verifiedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {ngoProfile.documents && ngoProfile.documents.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Uploaded Documents</h3>
              <div className="space-y-2">
                {ngoProfile.documents.map((doc: any) => (
                  <a
                    key={doc.id}
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <span className="text-sm">{doc.fileName}</span>
                    <span className="text-primary-600">View →</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



