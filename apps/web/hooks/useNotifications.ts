import { create } from 'zustand';
import { apiClient } from '@/lib/apiClient';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;

  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  clearError: () => void;
}

export const useNotifications = create<NotificationState>((set, get) => ({
  notifications: [],
  isLoading: false,
  error: null,
  unreadCount: 0,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient.getNotifications();
      set({
        notifications: data.notifications || [],
        unreadCount:
          (data.notifications || []).filter((n: any) => !n.isRead).length,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch notifications', isLoading: false });
    }
  },
  markNotificationRead: async (id) => {
    try {
      await apiClient.markNotificationRead(id);
      // Re-fetch after marking as read
      await get().fetchNotifications();
    } catch (error: any) {
      set({ error: error.message || 'Failed to mark notification as read' });
    }
  },
  markAllNotificationsRead: async () => {
    try {
      await apiClient.markAllNotificationsRead();
      await get().fetchNotifications();
    } catch (error: any) {
      set({ error: error.message || 'Failed to mark all as read' });
    }
  },
  clearError: () => set({ error: null }),
}));


