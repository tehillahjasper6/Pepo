'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/apiClient';
import { toast } from '@/components/Toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    avatar: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        city: user.city || '',
        avatar: user.avatar || '',
      });
      setLoading(false);
    } else {
      // Fetch user profile
      fetchUser().then(() => {
        if (user) {
          setFormData({
            name: user.name || '',
            city: user.city || '',
            avatar: user.avatar || '',
          });
        }
        setLoading(false);
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await apiClient.updateProfile(formData);
      await fetchUser(); // Refresh user data
      toast.success('Profile updated successfully! 🎉');
      router.push('/profile');
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      // Create FormData for image upload
      const formDataToSend = new FormData();
      formDataToSend.append('avatar', file);

      // Upload to backend (you may need to create an avatar upload endpoint)
      // For now, we'll use a placeholder approach
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    } catch (error: unknown) {
      toast.error('Failed to upload image');
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
    <div className="min-h-screen bg-background-default">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <span className="mr-2">←</span>
            Back to Profile
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-600 mt-2">Update your profile information</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">👤</span>
                )}
              </div>
              <div>
                <label className="cursor-pointer">
                  <span className="btn btn-secondary">Change Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG or GIF. Max size 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Your name"
            />
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              id="city"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., New York, NY"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4 pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary flex-1"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



