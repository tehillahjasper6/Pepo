"use client";

import { useState, useEffect } from 'react';
import { PepoBee } from '@/components/PepoBee';
import { apiClient } from '@/lib/apiClient';
import Badge from '@/components/Badge';
import Loading from '@/components/Loading';

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    primary: 'from-primary-500 to-primary-600',
    secondary: 'from-secondary-500 to-secondary-600',
    info: 'from-info-500 to-blue-600',
  };
  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} text-white rounded-lg shadow-card p-6`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-4xl font-bold">{value}</div>
      <div className="text-white/80 text-sm mt-1">{label}</div>
    </div>
  );
}

function SettingItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center">
        <span className="text-2xl mr-3">{icon}</span>
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-gray-600">{description}</div>
        </div>
      </div>
    </button>
  );
}
export default function ProfilePage() {
  const [stats] = useState({
    given: 0,
    received: 0,
    participated: 0,
  });
  const [badges, setBadges] = useState<Array<{ id: string; [key: string]: unknown }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await apiClient.getCurrentUser();
        const userId = me?.user?.id;
        if (userId) {
          const res = await apiClient.get(`/badges/user/${userId}`);
          if (mounted) setBadges(res || []);
        }
      } catch (e) {
        // ignore
      }
      setIsLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  if (isLoading) {
    return <Loading message="Loading your profile..." />;
  }

  return (
    <div className="min-h-screen bg-background-default">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
              <span className="text-5xl">👤</span>
            </div>
            <div className="ml-4 flex gap-2 flex-wrap">
              {badges.map((b) => (
                <Badge key={b.id} badge={b} />
              ))}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">User Name</h1>
              <p className="text-white/80 mt-1">New York, NY</p>
              <p className="text-white/60 text-sm mt-2">Member since December 2024</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="grid md:grid-cols-3 gap-4">
          <StatCard
            icon="🎁"
            label="Given"
            value={stats.given}
            color="primary"
          />
          <StatCard
            icon="🏆"
            label="Received"
            value={stats.received}
            color="secondary"
          />
          <StatCard
            icon="✋"
            label="Participated"
            value={stats.participated}
            color="info"
          />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* My Giveaways */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">My Giveaways</h2>
            <div className="text-center py-12">
              <PepoBee emotion="idle" size={150} />
              <p className="text-gray-600 mt-4">No giveaways yet</p>
              <a href="/create" className="btn btn-primary mt-4">
                Post Your First Item
              </a>
            </div>
          </div>

          {/* My Participations */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">My Interests</h2>
            <div className="text-center py-12">
              <PepoBee emotion="idle" size={150} />
              <p className="text-gray-600 mt-4">No participations yet</p>
              <a href="/browse" className="btn btn-primary mt-4">
                Browse Giveaways
              </a>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="card mt-6">
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          <div className="space-y-4">
            <a href="/profile/edit">
              <SettingItem
                icon="✏️"
                title="Edit Profile"
                description="Update your name, location, and photo"
              />
            </a>
            <SettingItem
              icon="🔔"
              title="Notifications"
              description="Manage your notification preferences"
            />
            <SettingItem
              icon="🔒"
              title="Privacy"
              description="Control your privacy settings"
            />
            <SettingItem
              icon="❓"
              title="Help & Support"
              description="Get help or contact support"
            />
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
              <div className="flex items-center">
                <span className="text-2xl mr-3">🚪</span>
                <div>
                  <div className="font-medium">Log Out</div>
                  <div className="text-sm text-gray-600">Sign out of your account</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

