import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Offline Sync Service
 * Manages queuing and syncing of offline actions to backend
 */
@Injectable()
export class OfflineSyncService {
  constructor(private prisma: PrismaService) {
    this.initializeSync();
  }

  /**
   * Initialize offline sync if supported
   */
  private initializeSync(): void {
    if (typeof window === 'undefined') return;

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(() => {
          // Service Worker registered successfully
        })
        .catch(() => {
          // Service Worker registration failed
        });
    }

    // Listen for sync messages from service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'giveaway-synced') {
          this.onGiveawaySynced(event.data.data);
        } else if (event.data.type === 'feedback-synced') {
          this.onFeedbackSynced(event.data.data);
        }
      });
    }
  }

  /**
   * Queue a giveaway for creation (offline)
   */
  async queueGiveaway(
    userId: string,
    giveawayData: {
      title: string;
      description: string;
      category: string;
      images: string[];
      quantity: number;
      pickup: boolean;
      pickupDetails?: string;
      location?: { latitude: number; longitude: number };
    }
  ): Promise<{ id: string; queued: boolean }> {
    if (!this.isOnline()) {
      // Store in IndexedDB for offline
      const id = this.generateId();
      await this.saveToIndexedDB('pending-giveaways', {
        id,
        userId,
        ...giveawayData,
        createdAt: new Date().toISOString(),
      });

      // Request background sync
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.sync.register('sync-giveaways');
        } catch (error) {
          console.error('Background sync registration failed:', error);
        }
      }

      return { id, queued: true };
    }

    // Online - create directly via API
    const response = await fetch('/api/giveaways', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({ userId, ...giveawayData }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create giveaway: ${response.statusText}`);
    }

    const giveaway = await response.json();
    return { id: giveaway.data.id, queued: false };
  }

  /**
   * Queue feedback submission (offline)
   */
  async queueFeedback(
    transactionId: string,
    feedbackData: {
      rating: number;
      comment: string;
      categories: string[];
      wouldRecommend: boolean;
      shouldInvestigate?: boolean;
    }
  ): Promise<{ id: string; queued: boolean }> {
    if (!this.isOnline()) {
      const id = this.generateId();
      await this.saveToIndexedDB('pending-feedback', {
        id,
        transactionId,
        ...feedbackData,
        createdAt: new Date().toISOString(),
      });

      // Request background sync
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.sync.register('sync-feedback');
        } catch (error) {
          console.error('Background sync registration failed:', error);
        }
      }

      return { id, queued: true };
    }

    // Online - submit directly
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({ transactionId, ...feedbackData }),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit feedback: ${response.statusText}`);
    }

    const feedback = await response.json();
    return { id: feedback.data.id, queued: false };
  }

  /**
   * Get pending giveaways
   */
  async getPendingGiveaways(): Promise<Array<{ [key: string]: unknown }>> {
    try {
      return await this.getFromIndexedDB('pending-giveaways');
    } catch (error: unknown) {
      return [];
    }
  }

  /**
   * Get pending feedback submissions
   */
  async getPendingFeedback(): Promise<Array<{ [key: string]: unknown }>> {
    try {
      return await this.getFromIndexedDB('pending-feedback');
    } catch (error: unknown) {
      return [];
    }
  }

  /**
   * Clear offline queue
   */
  async clearOfflineQueue(): Promise<void> {
    try {
      const db = await this.openIndexedDB();
      await this.clearObjectStore(db, 'pending-giveaways');
      await this.clearObjectStore(db, 'pending-feedback');
    } catch (error) {
      console.error('Failed to clear offline queue:', error);
    }
  }

  /**
   * Get offline data statistics
   */
  async getOfflineStats(): Promise<{
    isOnline: boolean;
    pendingGiveaways: number;
    pendingFeedback: number;
    lastSyncTime: string | null;
    cacheSize: string;
  }> {
    const pendingGiveaways = await this.getPendingGiveaways();
    const pendingFeedback = await this.getPendingFeedback();

    return {
      isOnline: this.isOnline(),
      pendingGiveaways: pendingGiveaways.length,
      pendingFeedback: pendingFeedback.length,
      lastSyncTime: this.getLastSyncTime(),
      cacheSize: await this.estimateCacheSize(),
    };
  }

  /**
   * Listen for online/offline events
   */
  onOnlineStatusChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Return unsubscribe function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  /**
   * Manually trigger sync
   */
  async manualSync(): Promise<{ success: boolean; message: string }> {
    if (!('serviceWorker' in navigator)) {
      return { success: false, message: 'Service Worker not supported' };
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      if ('SyncManager' in window) {
        await registration.sync.register('sync-giveaways');
        await registration.sync.register('sync-feedback');
        return { success: true, message: 'Sync queued' };
      }
    } catch (error) {
      console.error('Manual sync failed:', error);
    }

    return { success: false, message: 'Sync failed' };
  }

  // Private helpers

  private isOnline(): boolean {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine ?? true;
  }

  private getAuthToken(): string {
    if (typeof localStorage === 'undefined') return '';
    return localStorage.getItem('auth_token') || '';
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getLastSyncTime(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('last_sync_time') || null;
  }

  private async estimateCacheSize(): Promise<string> {
    if (!('storage' in navigator) || !navigator.storage.estimate) {
      return 'Unknown';
    }

    try {
      const estimate = await navigator.storage.estimate();
      const usedMB = (estimate.usage! / 1024 / 1024).toFixed(2);
      const quotaMB = (estimate.quota! / 1024 / 1024).toFixed(2);
      return `${usedMB}MB / ${quotaMB}MB`;
    } catch (error) {
      return 'Unknown';
    }
  }

  private async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PepoOfflineDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result as IDBDatabase;
        if (!db.objectStoreNames.contains('pending-giveaways')) {
          db.createObjectStore('pending-giveaways', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('pending-feedback')) {
          db.createObjectStore('pending-feedback', { keyPath: 'id' });
        }
      };
    });
  }

  private async saveToIndexedDB(storeName: string, data: any): Promise<void> {
    const db = await this.openIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async getFromIndexedDB(storeName: string): Promise<any[]> {
    const db = await this.openIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  private async clearObjectStore(
    db: IDBDatabase,
    storeName: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private onGiveawaySynced(giveaway: { [key: string]: unknown }): void {
    console.log('Giveaway synced:', giveaway);
    // Dispatch event for UI update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('giveaway-synced', { detail: giveaway })
      );
    }
  }

  private onFeedbackSynced(feedback: { [key: string]: unknown }): void {
    console.log('Feedback synced:', feedback);
    // Dispatch event for UI update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('feedback-synced', { detail: feedback })
      );
    }
  }
}
