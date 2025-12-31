/**
 * Push Notifications Hook for Mobile
 */

import { useEffect, useState, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { apiClient } from '../lib/apiClient';
import { useAuth } from './useAuth';

interface NotificationSettings {
  enabled: boolean;
  giveawayUpdates: boolean;
  messages: boolean;
  draws: boolean;
}

interface UsePushNotificationsState {
  isSupported: boolean;
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  settings: NotificationSettings;
  requestPermission: () => Promise<boolean>;
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => Promise<boolean>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
}

export const usePushNotifications = (): UsePushNotificationsState => {
  const { isAuthenticated, user } = useAuth();
  const [isSupported] = useState(true); // Expo supports notifications
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    giveawayUpdates: true,
    messages: true,
    draws: true,
  });

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (err: any) {
      console.error('Permission request failed:', err);
      return false;
    }
  }, []);

  // Register device for push notifications
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      setError('Please log in to enable notifications');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Request permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setError('Notification permission denied');
        return false;
      }

      // Get device push token
      const token = await Notifications.getDevicePushTokenAsync();
      
      // Register with backend
      await apiClient.post('/notifications/register-device', {
        token: token.data,
        platform: 'expo',
        deviceId: token.data,
      });

      setIsEnabled(true);
      setSettings((prev) => ({ ...prev, enabled: true }));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to enable notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, requestPermission]);

  // Disable push notifications
  const disableNotifications = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await Notifications.getDevicePushTokenAsync();
      
      // Unregister from backend
      await apiClient.post('/notifications/unregister-device', {
        token: token.data,
        platform: 'expo',
      });

      setIsEnabled(false);
      setSettings((prev) => ({ ...prev, enabled: false }));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to disable notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update notification settings
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedSettings = { ...settings, ...newSettings };
      
      // Save to backend
      await apiClient.post('/notifications/settings', updatedSettings);
      
      setSettings(updatedSettings);
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

  // Setup notification handlers
  useEffect(() => {
    if (!isSupported) return;

    // Handle notification received while app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Listen for notifications
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification interaction:', response.notification.request.content);
        // Handle notification tap
      }
    );

    return () => {
      subscription.remove();
    };
  }, [isSupported]);

  // Load settings on auth
  useEffect(() => {
    if (isAuthenticated && user) {
      // Load saved settings from backend or local storage
      const savedSettings = localStorage.getItem('notification_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
        setIsEnabled(JSON.parse(savedSettings).enabled);
      }
    }
  }, [isAuthenticated, user]);

  return {
    isSupported,
    isEnabled,
    isLoading,
    error,
    settings,
    requestPermission,
    enableNotifications,
    disableNotifications,
    updateSettings,
  };
};

export default usePushNotifications;
