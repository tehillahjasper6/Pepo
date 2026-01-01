'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { PepoIcon } from '@/components/PepoBee';
import { adminApiClient } from '@/lib/apiClient';

interface DashboardStats {
  totalUsers: number;
  totalGiveaways: number;
  totalNGOs: number;
  totalWinners: number;
  recentUsers: number;
  activeGiveaways: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalGiveaways: 0,
    totalNGOs: 0,
    totalWinners: 0,
    recentUsers: 0,
    activeGiveaways: 0,
  });
  const [pendingReports, setPendingReports] = useState(0);
  const [pendingNGOs, setPendingNGOs] = useState(0);

  const fetchDashboardData = async (): Promise<void> => {
    try {
      const [statsData, reportsData, ngosData] = await Promise.all([
        adminApiClient.getStats(),
        adminApiClient.getReports({ status: 'PENDING', limit: 1 }),
        adminApiClient.getPendingNGOs(),
      ]);

      setStats(statsData);
      setPendingReports(reportsData.pagination?.total || 0);
      setPendingNGOs(ngosData.ngos?.length || 0);
    } catch (error) {
      // Handle error silently
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <PepoIcon size={40} />
              <div>
                <h1 className="text-xl font-bold">PEPO Admin</h1>
                <p className="text-sm text-gray-500">Platform Management</p>
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
              <Link href="/audit" className="text-gray-600 hover:text-gray-900">
                Audit Logs
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon="👥"
            title="Total Users"
            value={stats.totalUsers}
            subtitle={`+${stats.recentUsers} this week`}
            color="blue"
          />
          <StatCard
            icon="🎁"
            title="Total Giveaways"
            value={stats.totalGiveaways}
            subtitle={`${stats.activeGiveaways} active`}
            color="green"
          />
          <StatCard
            icon="🏢"
            title="Verified NGOs"
            value={stats.totalNGOs}
            subtitle="Organizations"
            color="purple"
          />
          <StatCard
            icon="🏆"
            title="Total Winners"
            value={stats.totalWinners}
            subtitle="Items distributed"
            color="yellow"
          />
          <StatCard
            icon="⚠️"
            title="Pending Reports"
            value={pendingReports}
            subtitle="Requires attention"
            color="red"
          />
          <StatCard
            icon="✅"
            title="Pending NGOs"
            value={pendingNGOs}
            subtitle="Awaiting verification"
            color="indigo"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/ngo-review"
              className="p-4 border rounded-lg hover:bg-gray-50 text-center"
            >
              <div className="text-3xl mb-2">📋</div>
              <div className="font-medium">Review NGOs</div>
            </Link>
            <Link
              href="/reports"
              className="p-4 border rounded-lg hover:bg-gray-50 text-center"
            >
              <div className="text-3xl mb-2">🚨</div>
              <div className="font-medium">View Reports</div>
            </Link>
            <Link
              href="/users"
              className="p-4 border rounded-lg hover:bg-gray-50 text-center"
            >
              <div className="text-3xl mb-2">👥</div>
              <div className="font-medium">Manage Users</div>
            </Link>
            <Link
              href="/audit"
              className="p-4 border rounded-lg hover:bg-gray-50 text-center"
            >
              <div className="text-3xl mb-2">📊</div>
              <div className="font-medium">Audit Logs</div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Users</h2>
            <div className="space-y-3">
              <ActivityItem
                icon="👤"
                title="New user registered"
                time="2 minutes ago"
              />
              <ActivityItem
                icon="👤"
                title="New user registered"
                time="15 minutes ago"
              />
              <ActivityItem
                icon="👤"
                title="New user registered"
                time="1 hour ago"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Giveaways</h2>
            <div className="space-y-3">
              <ActivityItem
                icon="🎁"
                title="New giveaway posted"
                time="5 minutes ago"
              />
              <ActivityItem
                icon="🎲"
                title="Draw completed"
                time="30 minutes ago"
              />
              <ActivityItem
                icon="🎁"
                title="New giveaway posted"
                time="2 hours ago"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  subtitle: string;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'indigo';
}

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  time: string;
}

function StatCard({ icon, title, value, subtitle, color }: StatCardProps) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-full ${colors[color]} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold mb-1">{value.toLocaleString()}</div>
      <div className="text-sm font-medium text-gray-900 mb-1">{title}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  );
}

function ActivityItem({ icon, title, time }: ActivityItemProps) {
  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
      <div className="text-2xl">{icon}</div>
      <div className="flex-1">
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-gray-500">{time}</div>
      </div>
    </div>
  );
}

