'use client';

import { useState } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { PepoBee } from '@/components/PepoBee';

export default function SettingsPage() {
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications();
  const [loading, setLoading] = useState(false);

  const handleToggleNotifications = async () => {
    setLoading(true);
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background-default">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* Push Notifications */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Push Notifications</h2>
              <p className="text-gray-600 text-sm">
                Get notified when you win a giveaway, receive messages, or have new activity
              </p>
            </div>
            <div className="ml-4">
              {isSupported ? (
                <button
                  onClick={handleToggleNotifications}
                  disabled={loading}
                  className={`btn ${isSubscribed ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {loading ? '...' : isSubscribed ? 'Disable' : 'Enable'}
                </button>
              ) : (
                <div className="text-sm text-gray-500">
                  Not supported
                </div>
              )}
            </div>
          </div>

          {isSubscribed && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-center space-x-2">
              <PepoBee emotion="idle" size={40} />
              <span className="text-sm text-green-700">
                Push notifications are enabled! You&#39;ll receive alerts for important updates.
              </span>
            </div>
          )}
        </div>

        {/* Other Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          <p className="text-gray-600">More settings coming soon...</p>
        </div>
      </div>
    </div>
  );
}




