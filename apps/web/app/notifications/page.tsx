'use client';

import { useState } from 'react';
import { PepoBee } from '@/components/PepoBee';

export default function NotificationsPage() {
  const [notifications] = useState([]);

  return (
    <div className="min-h-screen bg-background-default">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Notifications</h1>

        {notifications.length === 0 ? (
          <div className="card">
            <div className="text-center py-20">
              <PepoBee emotion="idle" size={200} />
              <h2 className="text-2xl font-semibold mt-8 text-gray-900">
                You're all caught up!
              </h2>
              <p className="text-gray-600 mt-2">
                No new notifications at the moment.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification: any) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationCard({ notification }: any) {
  return (
    <div className="card hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex items-start space-x-4">
        <div className="text-3xl">{notification.icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
          <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
          <p className="text-gray-400 text-xs mt-2">{notification.time}</p>
        </div>
      </div>
    </div>
  );
}



