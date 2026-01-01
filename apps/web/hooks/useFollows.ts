import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

/**
 * Hook to manage NGO follow status with optimistic updates
 * Provides real-time follow/unfollow and status checking
 * @param ngoId NGO ID to follow
 * @returns Follow status and toggle function
 */
export function useFollowNGO(ngoId: string) {
  const queryClient = useQueryClient();

  // ✅ Query: Check current follow status
  const { data: status, isLoading: isCheckingStatus } = useQuery({
    queryKey: ['follow-status', ngoId],
    queryFn: async () => {
      const response = await api.get(`/follows/ngos/${ngoId}/status`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // ✅ Mutation: Toggle follow/unfollow with optimistic updates
  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (status?.isFollowing) {
        return api.delete(`/follows/ngos/${ngoId}`);
      } else {
        return api.post(`/follows/ngos/${ngoId}`);
      }
    },
    onMutate: async () => {
      // Cancel pending queries
      await queryClient.cancelQueries({ queryKey: ['follow-status', ngoId] });

      // Get previous state for rollback
      const previousStatus = queryClient.getQueryData(['follow-status', ngoId]);

      // Optimistically update
      queryClient.setQueryData(['follow-status', ngoId], {
        ...status,
        isFollowing: !status?.isFollowing,
      });

      return previousStatus;
    },
    onError: (error, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['follow-status', ngoId], context);
    },
    onSuccess: async () => {
      // Invalidate related queries
      await queryClient.invalidateQueries({ queryKey: ['follows'] });
      await queryClient.invalidateQueries({ queryKey: ['trending-ngos'] });
      await queryClient.invalidateQueries({ queryKey: ['suggested-ngos'] });
      await queryClient.invalidateQueries({ queryKey: ['ngo', ngoId] });
    },
  });

  return {
    isFollowing: status?.isFollowing || false,
    isMuted: status?.isMuted || false,
    isLoading: isCheckingStatus || toggleMutation.isPending,
    error: toggleMutation.error,
    toggle: toggleMutation.mutate,
  };
}

/**
 * Hook to get user's followed NGOs with pagination and filtering
 * @param page Page number (1-indexed)
 * @param limit Items per page
 * @param filters Category, sort, search
 */
export function useMyFollows(
  page: number = 1,
  limit: number = 20,
  filters?: { category?: string; sortBy?: string; search?: string },
) {
  return useQuery({
    queryKey: ['follows', page, limit, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.category && { category: filters.category }),
        ...(filters?.sortBy && { sortBy: filters.sortBy }),
        ...(filters?.search && { search: filters.search }),
      });

      const response = await api.get(`/follows?${params}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    keepPreviousData: true,
  });
}

/**
 * Hook to get trending NGOs
 * @param limit Number of results
 */
export function useTrendingNGOs(limit: number = 10) {
  return useQuery({
    queryKey: ['trending-ngos', limit],
    queryFn: async () => {
      const response = await api.get(`/follows/trending?limit=${limit}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to get personalized NGO suggestions
 * @param limit Number of suggestions
 */
export function useSuggestedNGOs(limit: number = 10) {
  return useQuery({
    queryKey: ['suggested-ngos', limit],
    queryFn: async () => {
      const response = await api.get(`/follows/suggestions?limit=${limit}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });
}

/**
 * Hook to mute/unmute an NGO
 * @param ngoId NGO ID
 */
export function useMuteNGO(ngoId: string) {
  const queryClient = useQueryClient();

  const muteMutation = useMutation({
    mutationFn: async (reason?: string) => {
      return api.post(`/follows/ngos/${ngoId}/mute`, { reason });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['follow-status', ngoId] });
      await queryClient.invalidateQueries({ queryKey: ['suggested-ngos'] });
    },
  });

  const unmuteMutation = useMutation({
    mutationFn: async () => {
      return api.delete(`/follows/ngos/${ngoId}/mute`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['follow-status', ngoId] });
      await queryClient.invalidateQueries({ queryKey: ['suggested-ngos'] });
    },
  });

  return {
    mute: muteMutation.mutate,
    unmute: unmuteMutation.mutate,
    isLoading: muteMutation.isPending || unmuteMutation.isPending,
    error: muteMutation.error || unmuteMutation.error,
  };
}

/**
 * Hook for batch follow/unfollow operations
 */
export function useBatchFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { ngoIds: string[]; action: 'follow' | 'unfollow' }) => {
      return api.post('/follows/batch', data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['follows'] });
      await queryClient.invalidateQueries({ queryKey: ['trending-ngos'] });
      await queryClient.invalidateQueries({ queryKey: ['suggested-ngos'] });
    },
  });
}

/**
 * Hook to get mutual followers for an NGO
 * @param ngoId NGO ID
 */
export function useMutualFollows(ngoId: string) {
  return useQuery({
    queryKey: ['mutual-follows', ngoId],
    queryFn: async () => {
      const response = await api.get(`/follows/ngos/${ngoId}/mutual`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}
