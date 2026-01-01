import axios from 'axios';
import { FilterParams } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  sendOTP: (email: string) => api.post('/auth/send-otp', { email }),
  verifyOTP: (email: string, code: string) => api.post('/auth/verify-otp', { email, code }),
  register: (data: Record<string, unknown>) => api.post('/auth/register', data),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  getCurrentUser: () => api.get('/auth/me'),
};

// Giveaways API
export const giveawaysApi = {
  getAll: (filters?: FilterParams) => api.get('/giveaways', { params: filters }),
  getById: (id: string) => api.get(`/giveaways/${id}`),
  create: (formData: FormData) => api.post('/giveaways', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id: string, data: Record<string, unknown>) => api.put(`/giveaways/${id}`, data),
  delete: (id: string) => api.delete(`/giveaways/${id}`),
  expressInterest: (id: string) => api.post(`/giveaways/${id}/interest`),
  withdrawInterest: (id: string) => api.delete(`/giveaways/${id}/interest`),
};

// Draw API
export const drawApi = {
  closeAndSelectWinners: (giveawayId: string) => api.post(`/draw/${giveawayId}/close`),
  getResults: (giveawayId: string) => api.get(`/draw/${giveawayId}/results`),
};

// Users API
export const usersApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: Record<string, unknown>) => api.put('/users/me', data),
  getStats: () => api.get('/users/me/stats'),
  getGiveaways: () => api.get('/users/me/giveaways'),
  getParticipations: () => api.get('/users/me/participations'),
  getWins: () => api.get('/users/me/wins'),
};

// Messages API
export const messagesApi = {
  send: (giveawayId: string, content: string) => 
    api.post('/messages', { giveawayId, content }),
  getByGiveaway: (giveawayId: string) => api.get(`/messages/giveaway/${giveawayId}`),
  getConversations: () => api.get('/messages/conversations'),
};

// Notifications API
export const notificationsApi = {
  getAll: (limit?: number) => api.get('/notifications', { params: { limit } }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
};

// NGO API
export const ngoApi = {
  apply: (data: Record<string, unknown>) => api.post('/ngo/apply', data),
  getProfile: () => api.get('/ngo/profile'),
  getVerified: () => api.get('/ngo/verified'),
  createCampaign: (data: Record<string, unknown>) => api.post('/ngo/campaigns', data),
  getCampaigns: () => api.get('/ngo/campaigns'),
  getDashboard: () => api.get('/ngo/dashboard'),
};

// Admin API
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (filters?: FilterParams) => api.get('/admin/users', { params: filters }),
  updateUserStatus: (userId: string, isActive: boolean) =>
    api.put(`/admin/users/${userId}/status`, { isActive }),
  getPendingNGOs: () => api.get('/admin/ngo/pending'),
  verifyNGO: (ngoProfileId: string) => api.post(`/admin/ngo/${ngoProfileId}/verify`),
  rejectNGO: (ngoProfileId: string, reason: string) =>
    api.post(`/admin/ngo/${ngoProfileId}/reject`, { reason }),
  getReports: (status?: string) => api.get('/admin/reports', { params: { status } }),
  resolveReport: (reportId: string, resolution: string) =>
    api.post(`/admin/reports/${reportId}/resolve`, { resolution }),
  getAuditLogs: (filters?: FilterParams) => api.get('/admin/audit-logs', { params: filters }),
};



