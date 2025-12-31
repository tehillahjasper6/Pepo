'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/hooks/useAuth';
import { PepoBee } from '@/components/PepoBee';
import { Toast } from '@/components/Toast';

interface SuccessStory {
  title: string;
  description: string;
  images: string[];
}

export default function TransparencyReportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    reportFrequency: 'QUARTERLY' as 'QUARTERLY' | 'ANNUAL',
    periodStart: '',
    periodEnd: '',
    campaignCount: 0,
    itemsDistributed: 0,
    locationsServed: [] as string[],
    fundsReceivedMin: '',
    fundsReceivedMax: '',
    fundsUtilized: {
      programDelivery: 0,
      administration: 0,
      fundraising: 0,
      other: 0,
    },
    beneficiariesReached: 0,
    successStories: [] as SuccessStory[],
    challenges: '',
    lessonsLearned: '',
    supportingDocuments: [] as string[],
  });

  const [newLocation, setNewLocation] = useState('');
  const [newStory, setNewStory] = useState<SuccessStory>({
    title: '',
    description: '',
    images: [],
  });

  useEffect(() => {
    if (!user || user.role !== 'NGO') {
      router.push('/login');
    }
  }, [user, router]);

  const handleSubmit = async (isDraft = false) => {
    try {
      setError(null);
      if (isDraft) {
        setSaving(true);
      } else {
        setLoading(true);
      }

      // Validate required fields
      if (!isDraft) {
        if (!formData.periodStart || !formData.periodEnd) {
          throw new Error('Please select reporting period');
        }
        if (formData.campaignCount === 0) {
          throw new Error('Please enter number of campaigns');
        }
        if (formData.itemsDistributed === 0) {
          throw new Error('Please enter items distributed');
        }
        if (formData.beneficiariesReached === 0) {
          throw new Error('Please enter beneficiaries reached');
        }
      }

      const payload = {
        reportFrequency: formData.reportFrequency,
        periodStart: new Date(formData.periodStart),
        periodEnd: new Date(formData.periodEnd),
        campaignCount: formData.campaignCount,
        itemsDistributed: formData.itemsDistributed,
        locationsServed: formData.locationsServed,
        fundsReceivedMin: formData.fundsReceivedMin
          ? parseFloat(formData.fundsReceivedMin)
          : undefined,
        fundsReceivedMax: formData.fundsReceivedMax
          ? parseFloat(formData.fundsReceivedMax)
          : undefined,
        fundsUtilized: formData.fundsUtilized,
        beneficiariesReached: formData.beneficiariesReached,
        successStories: formData.successStories,
        challenges: formData.challenges || undefined,
        lessonsLearned: formData.lessonsLearned || undefined,
        supportingDocuments: formData.supportingDocuments,
      };

      if (isDraft) {
        // Save as draft (would need reportId for updates)
        // For now, we'll just submit
        await apiClient.post('/ngo/trust/transparency-report', payload);
        setShowSuccess(true);
        setTimeout(() => {
          router.push('/ngo/dashboard');
        }, 2000);
      } else {
        await apiClient.post('/ngo/trust/transparency-report', payload);
        setShowSuccess(true);
        setTimeout(() => {
          router.push('/ngo/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
      setSaving(false);
    }
  };

  const addLocation = () => {
    if (newLocation.trim()) {
      setFormData({
        ...formData,
        locationsServed: [...formData.locationsServed, newLocation.trim()],
      });
      setNewLocation('');
    }
  };

  const removeLocation = (index: number) => {
    setFormData({
      ...formData,
      locationsServed: formData.locationsServed.filter((_, i) => i !== index),
    });
  };

  const addSuccessStory = () => {
    if (newStory.title.trim() && newStory.description.trim()) {
      setFormData({
        ...formData,
        successStories: [...formData.successStories, { ...newStory }],
      });
      setNewStory({ title: '', description: '', images: [] });
    }
  };

  const removeSuccessStory = (index: number) => {
    setFormData({
      ...formData,
      successStories: formData.successStories.filter((_, i) => i !== index),
    });
  };

  if (!user || user.role !== 'NGO') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-default py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Transparency Report</h1>
            <p className="text-gray-600">
              Submit your periodic transparency report to maintain donor confidence and
              demonstrate your organization's impact.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {showSuccess && (
            <div className="mb-6">
              <Toast
                message="Report submitted successfully! It will be reviewed by our team."
                type="success"
              />
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            {/* Reporting Period */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Reporting Period</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Report Frequency *
                  </label>
                  <select
                    value={formData.reportFrequency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reportFrequency: e.target.value as 'QUARTERLY' | 'ANNUAL',
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="ANNUAL">Annual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Period Start *
                  </label>
                  <input
                    type="date"
                    value={formData.periodStart}
                    onChange={(e) =>
                      setFormData({ ...formData, periodStart: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Period End *
                  </label>
                  <input
                    type="date"
                    value={formData.periodEnd}
                    onChange={(e) =>
                      setFormData({ ...formData, periodEnd: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
            </section>

            {/* Campaign Summary */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Campaign Summary</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Number of Campaigns *
                  </label>
                  <input
                    type="number"
                    value={formData.campaignCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        campaignCount: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Items Distributed *
                  </label>
                  <input
                    type="number"
                    value={formData.itemsDistributed}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        itemsDistributed: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Locations Served *
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                    placeholder="Add location"
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={addLocation}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.locationsServed.map((location, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm flex items-center gap-2"
                    >
                      {location}
                      <button
                        type="button"
                        onClick={() => removeLocation(index)}
                        className="text-primary-700 hover:text-primary-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Financial Summary (Optional) */}
            <section>
              <h2 className="text-xl font-semibold mb-4">
                Financial Summary <span className="text-sm font-normal text-gray-500">(Optional but encouraged)</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Funds Received (Min)
                  </label>
                  <input
                    type="number"
                    value={formData.fundsReceivedMin}
                    onChange={(e) =>
                      setFormData({ ...formData, fundsReceivedMin: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Funds Received (Max)
                  </label>
                  <input
                    type="number"
                    value={formData.fundsReceivedMax}
                    onChange={(e) =>
                      setFormData({ ...formData, fundsReceivedMax: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Program Delivery (%)
                  </label>
                  <input
                    type="number"
                    value={formData.fundsUtilized.programDelivery}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fundsUtilized: {
                          ...formData.fundsUtilized,
                          programDelivery: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Administration (%)
                  </label>
                  <input
                    type="number"
                    value={formData.fundsUtilized.administration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fundsUtilized: {
                          ...formData.fundsUtilized,
                          administration: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fundraising (%)
                  </label>
                  <input
                    type="number"
                    value={formData.fundsUtilized.fundraising}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fundsUtilized: {
                          ...formData.fundsUtilized,
                          fundraising: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Other (%)</label>
                  <input
                    type="number"
                    value={formData.fundsUtilized.other}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fundsUtilized: {
                          ...formData.fundsUtilized,
                          other: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </section>

            {/* Impact Metrics */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Impact Metrics</h2>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Beneficiaries Reached *
                </label>
                <input
                  type="number"
                  value={formData.beneficiariesReached}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      beneficiariesReached: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                  required
                />
              </div>

              {/* Success Stories */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Success Stories <span className="text-sm font-normal text-gray-500">(Optional)</span>
                </label>
                <div className="space-y-4 mb-4">
                  {formData.successStories.map((story, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{story.title}</h4>
                        <button
                          type="button"
                          onClick={() => removeSuccessStory(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">{story.description}</p>
                    </div>
                  ))}
                </div>
                <div className="border rounded-lg p-4 space-y-4">
                  <input
                    type="text"
                    value={newStory.title}
                    onChange={(e) =>
                      setNewStory({ ...newStory, title: e.target.value })
                    }
                    placeholder="Story title"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <textarea
                    value={newStory.description}
                    onChange={(e) =>
                      setNewStory({ ...newStory, description: e.target.value })
                    }
                    placeholder="Story description"
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={addSuccessStory}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Add Story
                  </button>
                </div>
              </div>
            </section>

            {/* Challenges & Lessons */}
            <section>
              <h2 className="text-xl font-semibold mb-4">
                Challenges & Lessons Learned <span className="text-sm font-normal text-gray-500">(Optional)</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Challenges</label>
                  <textarea
                    value={formData.challenges}
                    onChange={(e) =>
                      setFormData({ ...formData, challenges: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Describe any challenges faced during this period..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Lessons Learned
                  </label>
                  <textarea
                    value={formData.lessonsLearned}
                    onChange={(e) =>
                      setFormData({ ...formData, lessonsLearned: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Share key lessons learned..."
                  />
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={saving || loading}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={loading || saving}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <PepoBee emotion="loading" size={20} />
                      Submitting...
                    </span>
                  ) : (
                    'Submit Report'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}



