import React, { useEffect, useState } from 'react';

const VerificationWidget: React.FC<{ userId: string }> = ({ userId }) => {
  const [status, setStatus] = useState<{ [key: string]: unknown } | null>(null);
  const [badge, setBadge] = useState<{ [key: string]: unknown } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // TODO: Fetch from API
        setStatus({
          verificationSteps: [
            { type: 'email', status: 'verified' },
            { type: 'phone', status: 'pending' },
            { type: 'government_id', status: 'pending' },
            { type: 'address', status: 'pending' },
          ],
          isFullyVerified: false,
          completionPercentage: 25,
          verificationLevel: 'UNVERIFIED',
          benefits: [],
        });

        // TODO: Fetch badge
        setBadge({
          badges: [
            {
              type: 'email_verified',
              label: 'Email Verified',
              icon: '✉️',
              color: 'blue',
            },
          ],
          trustBoost: 5,
        });
      } catch (error) {
        console.error('Failed to fetch verification status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [userId]);

  if (loading) {
    return <div className="p-4 bg-gray-100 rounded-lg animate-pulse h-64" />;
  }

  const stepIcons: { [key: string]: string } = {
    email: '✉️',
    phone: '📱',
    government_id: '🆔',
    address: '📍',
  };

  const stepLabels: { [key: string]: string } = {
    email: 'Email',
    phone: 'Phone',
    government_id: 'Government ID',
    address: 'Address',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">Verification Progress</h2>
          {status?.isFullyVerified && (
            <span className="text-2xl">✓ Fully Verified</span>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${status?.completionPercentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {status?.completionPercentage}% Complete
        </p>
      </div>

      {/* Verification steps */}
      <div className="space-y-3">
        {status?.verificationSteps?.map((step: { type: string; status: string; [key: string]: unknown }) => (
          <div
            key={step.type}
            className={`border rounded-lg p-4 ${
              step.status === 'verified'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{stepIcons[step.type]}</span>
                <div>
                  <p className="font-semibold">{stepLabels[step.type]}</p>
                  <p className="text-xs text-gray-600 capitalize">
                    {step.status}
                  </p>
                </div>
              </div>

              {step.status === 'verified' ? (
                <span className="text-green-600 font-bold">✓</span>
              ) : (
                <button
                  onClick={() => setActiveStep(step.type)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Verify
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Verification badges */}
      {badge?.badges && badge.badges.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <p className="text-sm font-semibold mb-3">Verification Badges</p>
          <div className="flex flex-wrap gap-2">
            {badge.badges.map((b: { type: string; color: string; icon: string; label: string }) => (
              <div
                key={b.type}
                className={`px-3 py-2 rounded-full text-sm font-semibold text-white bg-${b.color}-600`}
              >
                {b.icon} {b.label}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Trust boost: +{badge.trustBoost} points
          </p>
        </div>
      )}

      {/* Benefits */}
      {status?.benefits && status.benefits.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-semibold mb-2">Unlock Benefits:</p>
          <ul className="text-sm text-gray-700 space-y-1">
            {status.benefits.map((benefit: string, i: number) => (
              <li key={i} className="flex items-center gap-2">
                <span>→</span> {benefit}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VerificationWidget;
