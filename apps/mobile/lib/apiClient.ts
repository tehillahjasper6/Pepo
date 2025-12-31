/**
 * API Client for PEPO Mobile App
 * Shared with web app API client pattern
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getToken(): Promise<string | null> {
    // Use Expo SecureStore for mobile
    const { SecureStore } = require('expo-secure-store');
    return await SecureStore.getItemAsync('pepo_token');
  }

  private async setToken(token: string): Promise<void> {
    const { SecureStore } = require('expo-secure-store');
    await SecureStore.setItemAsync('pepo_token', token);
  }

  private async removeToken(): Promise<void> {
    const { SecureStore } = require('expo-secure-store');
    await SecureStore.deleteItemAsync('pepo_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        await this.removeToken();
        throw new Error('Unauthorized. Please log in again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async login(email: string, password: string) {
    const response = await this.post<{ user: any; access_token: string }>(
      '/auth/login',
      { email, password }
    );
    await this.setToken(response.access_token);
    return response;
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    city: string;
    gender?: string;
  }) {
    const response = await this.post<{ user: any; access_token: string }>(
      '/auth/register',
      data
    );
    await this.setToken(response.access_token);
    return response;
  }

  async getGiveaways(params?: { category?: string }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.get<{ giveaways: any[] }>(
      `/giveaways${queryString ? `?${queryString}` : ''}`
    );
  }

  async getGiveaway(id: string) {
    return this.get<{ giveaway: any }>(`/giveaways/${id}`);
  }

  async createGiveaway(data: FormData) {
    const token = await this.getToken();
    const response = await fetch(`${this.baseUrl}/giveaways`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create giveaway');
    }

    return response.json();
  }

  async expressInterest(giveawayId: string) {
    return this.post(`/giveaways/${giveawayId}/participate`);
  }

  async withdrawInterest(giveawayId: string) {
    return this.request(`/giveaways/${giveawayId}/participate`, {
      method: 'DELETE',
    });
  }

  async conductDraw(giveawayId: string) {
    return this.post(`/draw/${giveawayId}/conduct`);
  }

  async getNotifications() {
    return this.get<{ notifications: any[] }>('/notifications');
  }

  async getUnreadCount() {
    return this.get<{ count: number }>('/notifications/unread-count');
  }

  async getMyProfile() {
    return this.get<{ user: any }>('/users/me');
  }

  async getMyStats() {
    return this.get<{ given: number; received: number; participated: number }>('/users/me/stats');
  }

  async getMyGiveaways() {
    return this.get<{ giveaways: any[] }>('/users/me/giveaways');
  }

  async getMyParticipations() {
    return this.get<{ participations: any[] }>('/users/me/participations');
  }

  async getMyWins() {
    return this.get<{ wins: any[] }>('/users/me/wins');
  }

  async getConversations() {
    return this.get<any[]>('/messages/conversations');
  }

  async getMessages(giveawayId: string) {
    return this.get<any[]>(`/messages/giveaway/${giveawayId}`);
  }

  async sendMessage(giveawayId: string, content: string) {
    return this.post(`/messages`, { giveawayId, content });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

