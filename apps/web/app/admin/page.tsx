'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  totalGiveaways: number;
  activeGiveaways: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status'>('date');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Check admin access
  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      router.push('/');
    }
  }, [user, router]);

  // Load users and stats
  useEffect(() => {
    if (user?.id) {
      loadUsers();
      loadStats();
    }
  }, [user?.id]);

  // Filter and sort users
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (u.phone?.includes(searchTerm) ?? false)
      );
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter((u) => u.role === filterRole);
    }

    // Status filter
    if (filterStatus === 'active') {
      filtered = filtered.filter((u) => u.isActive);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter((u) => !u.isActive);
    } else if (filterStatus === 'verified') {
      filtered = filtered.filter((u) => u.isVerified);
    } else if (filterStatus === 'unverified') {
      filtered = filtered.filter((u) => !u.isVerified);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
        );
      } else if (sortBy === 'status') {
        return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
      } else {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    });

    setFilteredUsers(sorted);
  }, [users, searchTerm, filterRole, filterStatus, sortBy]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient('/admin/users', {
        method: 'GET',
      });
      setUsers(response.users || []);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiClient('/admin/stats', {
        method: 'GET',
      });
      setStats(response.stats);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleUpdateUser = useCallback(
    async (
      userId: string,
      updates: { isActive?: boolean; role?: string }
    ) => {
      try {
        setIsUpdating(true);
        await apiClient(`/admin/users/${userId}`, {
          method: 'PATCH',
          body: JSON.stringify(updates),
        });

        // Update local state
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
        );

        setSelectedUser((prev) =>
          prev && prev.id === userId ? { ...prev, ...updates } : prev
        );

        setError(null);
      } catch (err) {
        setError('Failed to update user');
        console.error('Error updating user:', err);
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  const handleDeleteUser = useCallback(
    async (userId: string) => {
      if (!confirm('Are you sure you want to delete this user?')) {
        return;
      }

      try {
        setIsUpdating(true);
        await apiClient(`/admin/users/${userId}`, {
          method: 'DELETE',
        });

        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setSelectedUser(null);
        setError(null);
      } catch (err) {
        setError('Failed to delete user');
        console.error('Error deleting user:', err);
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-default">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage users and monitor platform activity</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="card bg-blue-50 border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
            </div>
            <div className="card bg-green-50 border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Active Users</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
            </div>
            <div className="card bg-purple-50 border border-purple-200">
              <p className="text-sm text-gray-600 mb-1">Verified Users</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.verifiedUsers}
              </p>
            </div>
            <div className="card bg-orange-50 border border-orange-200">
              <p className="text-sm text-gray-600 mb-1">Total Giveaways</p>
              <p className="text-3xl font-bold text-orange-600">
                {stats.totalGiveaways}
              </p>
            </div>
            <div className="card bg-red-50 border border-red-200">
              <p className="text-sm text-gray-600 mb-1">Active Giveaways</p>
              <p className="text-3xl font-bold text-red-600">
                {stats.activeGiveaways}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Users List */}
          <div className="lg:col-span-2 card">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Users</h2>

              {/* Search and Filters */}
              <div className="space-y-4 mb-6">
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />

                {/* Filters */}
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="all">All Roles</option>
                    <option value="USER">User</option>
                    <option value="MODERATOR">Moderator</option>
                    <option value="ADMIN">Admin</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="verified">Verified</option>
                    <option value="unverified">Unverified</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as 'name' | 'date' | 'status')
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="date">Newest First</option>
                    <option value="name">By Name</option>
                    <option value="status">By Status</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading users...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No users found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-semibold">Name</th>
                        <th className="text-left py-3 px-2 font-semibold">Email</th>
                        <th className="text-left py-3 px-2 font-semibold">Role</th>
                        <th className="text-left py-3 px-2 font-semibold">Status</th>
                        <th className="text-left py-3 px-2 font-semibold">Joined</th>
                        <th className="text-center py-3 px-2 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr
                          key={u.id}
                          className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedUser(u)}
                        >
                          <td className="py-3 px-2">
                            {u.firstName} {u.lastName}
                          </td>
                          <td className="py-3 px-2 text-gray-600">{u.email}</td>
                          <td className="py-3 px-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                u.role === 'ADMIN'
                                  ? 'bg-red-100 text-red-700'
                                  : u.role === 'MODERATOR'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              {u.isActive && (
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              )}
                              {!u.isActive && (
                                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                              )}
                              <span className="text-xs">
                                {u.isActive ? 'Active' : 'Inactive'}
                              </span>
                              {u.isVerified && (
                                <span className="ml-2 text-blue-600">✓</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-gray-600 text-xs">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(u);
                              }}
                              className="text-primary-600 hover:text-primary-700 font-semibold"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* User Details Panel */}
          <div className="lg:col-span-1">
            {selectedUser ? (
              <div className="card sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  User Details
                </h3>

                <div className="space-y-4">
                  {/* User Info */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                      Name
                    </label>
                    <p className="text-gray-900 font-semibold">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                      Email
                    </label>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>

                  {selectedUser.phone && (
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase">
                        Phone
                      </label>
                      <p className="text-gray-900">{selectedUser.phone}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                      Joined
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {selectedUser.lastLoginAt && (
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase">
                        Last Login
                      </label>
                      <p className="text-gray-900">
                        {new Date(selectedUser.lastLoginAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {/* Role Selection */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                      Role
                    </label>
                    <select
                      value={selectedUser.role}
                      onChange={(e) =>
                        handleUpdateUser(selectedUser.id, {
                          role: e.target.value,
                        })
                      }
                      disabled={isUpdating}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      <option value="USER">User</option>
                      <option value="MODERATOR">Moderator</option>
                      {user?.role === 'ADMIN' && (
                        <option value="ADMIN">Admin</option>
                      )}
                    </select>
                  </div>

                  {/* Status Toggle */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                      Status
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          handleUpdateUser(selectedUser.id, {
                            isActive: !selectedUser.isActive,
                          })
                        }
                        disabled={isUpdating}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                          selectedUser.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">
                      Verification
                    </label>
                    <p className="text-gray-900">
                      {selectedUser.isVerified ? (
                        <span className="text-green-600 font-semibold">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="text-orange-600 font-semibold">
                          ✗ Pending Verification
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <button
                      onClick={() => handleDeleteUser(selectedUser.id)}
                      disabled={isUpdating}
                      className="w-full px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      Delete User
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card text-center text-gray-500 py-8">
                Select a user to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
