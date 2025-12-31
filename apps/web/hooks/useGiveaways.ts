/**
 * Giveaways Hook
 * Manages giveaway state and operations
 */

import { create } from 'zustand';
import { apiClient } from '@/lib/apiClient';

interface Giveaway {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  images: string[];
  status: 'ACTIVE' | 'CLOSED' | 'COMPLETED';
  eligibilityGender?: string;
  quantity: number;
  participantCount: number;
  createdAt: string;
  endsAt?: string;
  creator: {
    id: string;
    name: string;
    city: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface GiveawayState {
  giveaways: Giveaway[];
  currentGiveaway: Giveaway | null;
  isLoading: boolean;
  error: string | null;
  pagination: Pagination | null;
  filters: {
    status?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  };

  // Actions
  fetchGiveaways: () => Promise<void>;
  fetchGiveaway: (id: string) => Promise<void>;
  createGiveaway: (data: FormData) => Promise<void>;
  updateGiveaway: (id: string, data: any) => Promise<void>;
  deleteGiveaway: (id: string) => Promise<void>;
  expressInterest: (id: string) => Promise<void>;
  withdrawInterest: (id: string) => Promise<void>;
  conductDraw: (id: string) => Promise<any>;
  setFilters: (filters: any) => void;
  setPage: (page: number) => void;
  clearError: () => void;
}

export const useGiveaways = create<GiveawayState>((set, get) => ({
  giveaways: [],
  currentGiveaway: null,
  isLoading: false,
  error: null,
  pagination: null,
  filters: {
    page: 1,
    limit: 12,
  },

  fetchGiveaways: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const response = await apiClient.getGiveaways(filters);
      set({
        giveaways: response.giveaways || response.giveaways || [],
        pagination: response.pagination || null,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch giveaways',
        isLoading: false,
      });
    }
  },

  fetchGiveaway: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getGiveaway(id);
      set({
        currentGiveaway: response.giveaway,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch giveaway',
        isLoading: false,
      });
    }
  },

  createGiveaway: async (data: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.createGiveaway(data);
      set({
        giveaways: [response.giveaway, ...get().giveaways],
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create giveaway',
        isLoading: false,
      });
      throw error;
    }
  },

  updateGiveaway: async (id: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.updateGiveaway(id, data);
      set({
        giveaways: get().giveaways.map((g) =>
          g.id === id ? response.giveaway : g
        ),
        currentGiveaway:
          get().currentGiveaway?.id === id
            ? response.giveaway
            : get().currentGiveaway,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update giveaway',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteGiveaway: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.deleteGiveaway(id);
      set({
        giveaways: get().giveaways.filter((g) => g.id !== id),
        currentGiveaway:
          get().currentGiveaway?.id === id ? null : get().currentGiveaway,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete giveaway',
        isLoading: false,
      });
      throw error;
    }
  },

  expressInterest: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.expressInterest(id);
      // Update participant count
      if (get().currentGiveaway?.id === id) {
        set({
          currentGiveaway: {
            ...get().currentGiveaway!,
            participantCount: get().currentGiveaway!.participantCount + 1,
          },
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to express interest',
        isLoading: false,
      });
      throw error;
    }
  },

  withdrawInterest: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.withdrawInterest(id);
      // Update participant count
      if (get().currentGiveaway?.id === id) {
        set({
          currentGiveaway: {
            ...get().currentGiveaway!,
            participantCount: Math.max(
              0,
              get().currentGiveaway!.participantCount - 1
            ),
          },
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to withdraw interest',
        isLoading: false,
      });
      throw error;
    }
  },

  conductDraw: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.conductDraw(id);
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to conduct draw',
        isLoading: false,
      });
      throw error;
    }
  },

  setFilters: (filters: any) => {
    set({ filters: { ...get().filters, ...filters, page: 1 } }); // Reset to page 1 when filters change
    get().fetchGiveaways();
  },

  setPage: (page: number) => {
    set({ filters: { ...get().filters, page } });
    get().fetchGiveaways();
  },

  clearError: () => set({ error: null }),
}));

