'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { PepoBee } from '@/components/PepoBee';
import Image from 'next/image';

interface NGOProfile {
  id: string;
  organizationName: string;
  logo?: string;
  country: string;
  city: string;
  yearEstablished?: number;
  missionStatement?: string;
  focusAreas: string[];
  hasGovernmentRecognition: boolean;
  governmentRecognitionBadge?: string;
  website?: string;
  totalItemsDistributed: number;
  totalBeneficiariesImpacted: number;
  activeCampaigns: Array<{ id: string; [key: string]: unknown }>;
  pastCampaigns: Array<{ id: string; [key: string]: unknown }>;
  transparencyReports: Array<{ id: string; [key: string]: unknown }>;
  confidenceScore: {
    score: number;
    level: 'EMERGING' | 'TRUSTED' | 'HIGHLY_TRUSTED';
    lastUpdated: string;
  };
  verifiedAt: string;
}

export default function NGOPublicProfilePage() {
  const params = useParams();
  const ngoId = params.id as string;
  const [profile, setProfile] = useState<NGOProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [ngoId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get(`/ngo/trust/profile/${ngoId}`);
      setProfile(data);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load NGO profile';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceLabel = (level: string) => {
    switch (level) {
      case 'HIGHLY_TRUSTED':
        return 'Highly Trusted';
      case 'TRUSTED':
        return 'Trusted';
      default:
        return 'Emerging';
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'HIGHLY_TRUSTED':
        return 'bg-green-500';
      case 'TRUSTED':
        return 'bg-blue-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getFocusAreaLabel = (area: string) => {
    const labels: Record<string, string> = {
      EDUCATION: 'Education',
      HEALTH: 'Health',
      RELIEF: 'Relief',
      WOMEN: 'Women',
      YOUTH: 'Youth',
      ENVIRONMENT: 'Environment',
      OTHER: 'Other',
    };
    return labels[area] || area;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-default flex items-center justify-center">
        <div className="text-center">
          <PepoBee emotion="loading" size={120} />
          <p className="mt-4 text-gray-600">Loading NGO profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background-default flex items-center justify-center">
        <div className="text-center">
          <PepoBee emotion="alert" size={120} />
          <p className="mt-4 text-red-600">{error || 'NGO profile not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-default">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {profile.logo && (
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                <Image
                  src={profile.logo}
                  alt={profile.organizationName}
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{profile.organizationName}</h1>
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  ✓ Pepo Verified
                </span>
                {profile.hasGovernmentRecognition && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {profile.governmentRecognitionBadge || 'Government Recognized'}
                  </span>
                )}
              </div>
              <p className="text-gray-600">
                📍 {profile.city}, {profile.country}
                {profile.yearEstablished && ` • Established ${profile.yearEstablished}`}
              </p>
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 text-sm mt-1 inline-block"
                >
                  Visit Website →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Mission Statement */}
            {profile.missionStatement && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Mission Statement</h2>
                <p className="text-gray-700 leading-relaxed">{profile.missionStatement}</p>
              </div>
            )}

            {/* Focus Areas */}
            {profile.focusAreas.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Focus Areas</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.focusAreas.map((area) => (
                    <span
                      key={area}
                      className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                    >
                      {getFocusAreaLabel(area)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Transparency Reports */}
            {profile.transparencyReports.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Transparency Reports</h2>
                <div className="space-y-4">
                  {profile.transparencyReports.map((report) => (
                    <div
                      key={report.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">
                          {report.reportFrequency === 'QUARTERLY' ? 'Quarterly' : 'Annual'} Report
                        </h3>
                        <span className="text-sm text-gray-500">
                          {new Date(report.periodStart).toLocaleDateString()} -{' '}
                          {new Date(report.periodEnd).toLocaleDateString()}
                        </span>
                      </div>
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
              </div>
            )}

            {/* Active Campaigns */}
            {profile.activeCampaigns.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Active Campaigns</h2>
                <div className="space-y-4">
                  {profile.activeCampaigns.map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">{campaign.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                      <div className="text-sm text-gray-500">
                        {campaign.totalGiveaways} giveaways • {campaign.totalReached} reached
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Confidence Score */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Donor Confidence</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Score</span>
                    <span className="text-2xl font-bold">{profile.confidenceScore.score}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getConfidenceColor(
                        profile.confidenceScore.level
                      )}`}
                      style={{ width: `${profile.confidenceScore.score}%` }}
                    />
                  </div>
                </div>
                <div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      profile.confidenceScore.level === 'HIGHLY_TRUSTED'
                        ? 'bg-green-100 text-green-700'
                        : profile.confidenceScore.level === 'TRUSTED'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {getConfidenceLabel(profile.confidenceScore.level)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Updated {new Date(profile.confidenceScore.lastUpdated).toLocaleDateString()}
                </p>
                <details className="text-xs text-gray-600">
                  <summary className="cursor-pointer text-primary-600 hover:text-primary-700">
                    What does this score mean?
                  </summary>
                  <div className="mt-2 space-y-1">
                    <p>
                      The confidence score reflects transparency, activity, and impact. It includes:
                    </p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>Verification status</li>
                      <li>Transparency report consistency</li>
                      <li>Recent activity and giving</li>
                      <li>Campaign completion rates</li>
                      <li>Community feedback</li>
                    </ul>
                  </div>
                </details>
              </div>
            </div>

            {/* Impact Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Impact</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-primary-600">
                    {profile.totalItemsDistributed.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Items Distributed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-600">
                    {profile.totalBeneficiariesImpacted.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Beneficiaries Impacted</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-600">
                    {profile.activeCampaigns.length + profile.pastCampaigns.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Campaigns</div>
                </div>
              </div>
            </div>

            {/* Verification Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Verification</h2>
              <p className="text-sm text-gray-600 mb-2">
                This organization has been verified by Pepo and meets our standards for
                transparency and accountability.
              </p>
              <p className="text-xs text-gray-500">
                Verified on {new Date(profile.verifiedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




