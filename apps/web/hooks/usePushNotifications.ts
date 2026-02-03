/**
 * Push Notifications Hook
 * Handles push notification subscription and management
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { apiClient } from '@/lib/apiClient';
import { toast } from '@/components/Toast';

export const usePushNotifications = () => {
  const { isAuthenticated, user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(null);

  // Check if push notifications are supported
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
    }
  }, []);

  // Get VAPID public key
  useEffect(() => {
    if (isSupported && isAuthenticated) {
      apiClient
        .get<{ publicKey: string }>('/notifications/vapid-key')
        .then((response) => {
          setVapidPublicKey(response.publicKey);
        })
        .catch(console.error);
    }
  }, [isSupported, isAuthenticated]);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!isSupported) return null;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }, [isSupported]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in this browser');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported || !vapidPublicKey || !isAuthenticated) {
      return false;
    }

    try {
      // Register service worker
      const registration = await registerServiceWorker();
      if (!registration) {
        throw new Error('Service Worker registration failed');
      }

      // Request permission
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        toast.error('Notification permission denied');
        return false;
      }

      // Subscribe to push
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Register with backend
      await apiClient.post('/notifications/register-device', {
        subscription: pushSubscription.toJSON(),
      });

      setSubscription(pushSubscription);
      setIsSubscribed(true);
      toast.success('Push notifications enabled! 🔔');
      return true;
    } catch (error: any) {
      console.error('Push subscription failed:', error);
      toast.error('Failed to enable push notifications');
      return false;
    }
  }, [isSupported, vapidPublicKey, isAuthenticated, registerServiceWorker, requestPermission]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!subscription) return false;

    try {
      await subscription.unsubscribe();
      await apiClient.post('/notifications/unregister-device', {
        subscription: subscription.toJSON(),
      });

      setSubscription(null);
      setIsSubscribed(false);
      toast.info('Push notifications disabled');
      return true;
    } catch (error: any) {
      console.error('Push unsubscription failed:', error);
      toast.error('Failed to disable push notifications');
      return false;
    }
  }, [subscription]);

  // Check existing subscription
  useEffect(() => {
    if (isSupported && isAuthenticated && vapidPublicKey) {
      registerServiceWorker().then(async (registration) => {
        if (registration) {
          const existingSubscription = await registration.pushManager.getSubscription();
          if (existingSubscription) {
            setSubscription(existingSubscription);
            setIsSubscribed(true);
          }
        }
      });
    }
  }, [isSupported, isAuthenticated, vapidPublicKey, registerServiceWorker]);

  return {
    isSupported,
    isSubscribed,
    subscribe,
    unsubscribe,
    requestPermission,
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}




