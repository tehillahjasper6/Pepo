/**
 * API Client for PEPO Platform
 * Handles all HTTP requests to the backend with authentication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get authorization token from localStorage
   */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('pepo_token');
  }

  /**
   * Save authorization token to localStorage
   */
  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('pepo_token', token);
  }

  /**
   * Remove authorization token from localStorage
   */
  private removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('pepo_token');
  }

  /**
   * Make an HTTP request
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    const authToken = token || this.getToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      // Handle different HTTP status codes
      if (response.status === 401) {
        this.removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Your session has expired. Please log in again.');
      }

      if (response.status === 403) {
        throw new Error('You do not have permission to perform this action.');
      }

      if (response.status === 404) {
        throw new Error('The requested resource was not found.');
      }

      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }

      if (response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }

      // Parse response
      let data;
      try {
        data = await response.json();
      } catch (e) {
        // If response is not JSON, use status text
        throw new Error(response.statusText || 'An error occurred');
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || 'An error occurred');
      }

      return data;
    } catch (error: any) {
      console.error('API Request Error:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      // Re-throw with better message if it's already an Error
      if (error instanceof Error) {
        throw error;
      }
      
      // Handle unknown errors
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // ==================== AUTH ENDPOINTS ====================

  /**
   * Register a new user
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    city: string;
    gender?: string;
  }) {
    const response = await this.post<{ user: any; access_token: string }>(
      '/auth/register',
      data
    );
    this.setToken(response.access_token);
    return response;
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string) {
    const response = await this.post<{ user: any; access_token: string }>(
      '/auth/login',
      { email, password }
    );
    this.setToken(response.access_token);
    return response;
  }

  /**
   * Logout
   */
  logout() {
    this.removeToken();
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    return this.get<{ user: any }>('/auth/me');
  }

  /**
   * Update user profile
   */
  async updateProfile(data: { name?: string; city?: string; avatar?: string }) {
    return this.put<{ user: any }>('/users/me', data);
  }

  /**
   * Send OTP to email or phone
   */
  async sendOTP(email?: string, phone?: string) {
    return this.post('/auth/send-otp', { email, phone });
  }

  /**
   * Verify OTP (supports email or phone)
   */
  async verifyOTP(email: string | undefined, phone: string | undefined, otp: string) {
    const response = await this.post<{ user: any; access_token: string }>(
      '/auth/verify-otp',
      { email, phone, code: otp }
    );
    this.setToken(response.access_token);
    return response;
  }

  // ==================== GIVEAWAY ENDPOINTS ====================

  /**
   * Get all giveaways
   */
  async getGiveaways(params?: {
    status?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams: any = {};
    if (params?.status) queryParams.status = params.status;
    if (params?.category) queryParams.category = params.category;
    if (params?.search) queryParams.search = params.search;
    if (params?.page) queryParams.page = params.page.toString();
    if (params?.limit) queryParams.limit = params.limit.toString();
    
    const queryString = new URLSearchParams(queryParams).toString();
    return this.get<{ giveaways: any[]; pagination: any }>(
      `/giveaways${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get a single giveaway by ID
   */
  async getGiveaway(id: string) {
    return this.get<{ giveaway: any }>(`/giveaways/${id}`);
  }

  /**
   * Create a new giveaway
   */
  async createGiveaway(data: FormData) {
    const token = this.getToken();
    const response = await fetch(`${this.baseUrl}/giveaways`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data, // FormData for file upload
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create giveaway');
    }

    return response.json();
  }

  /**
   * Update a giveaway
   */
  async updateGiveaway(id: string, data: any) {
    return this.patch(`/giveaways/${id}`, data);
  }

  /**
   * Delete a giveaway
   */
  async deleteGiveaway(id: string) {
    return this.delete(`/giveaways/${id}`);
  }

  // ==================== PARTICIPATION ENDPOINTS ====================

  /**
   * Express interest in a giveaway
   */
  async expressInterest(giveawayId: string) {
    return this.post(`/giveaways/${giveawayId}/participate`);
  }

  /**
   * Withdraw interest from a giveaway
   */
  async withdrawInterest(giveawayId: string) {
    return this.delete(`/giveaways/${giveawayId}/participate`);
  }

  // ==================== DRAW ENDPOINTS ====================

  /**
   * Conduct a random draw for a giveaway
   */
  async conductDraw(giveawayId: string) {
    return this.post(`/draw/${giveawayId}/conduct`);
  }

  /**
   * Get draw logs for a giveaway
   */
  async getDrawLogs(giveawayId: string) {
    return this.get(`/draw/${giveawayId}/logs`);
  }

  // ==================== USER ENDPOINTS ====================

  /**
   * Get user profile
   */
  async getUserProfile(userId?: string) {
    const endpoint = userId ? `/users/${userId}` : '/users/me';
    return this.get<{ user: any }>(endpoint);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(data: any) {
    return this.patch('/users/me', data);
  }

  /**
   * Get user's giveaways
   */
  async getUserGiveaways() {
    return this.get('/users/me/giveaways');
  }

  /**
   * Get user's participations
   */
  async getUserParticipations() {
    return this.get('/users/me/participations');
  }

  // ==================== MESSAGE ENDPOINTS ====================

  /**
   * Get conversations
   */
  async getConversations() {
    return this.get('/messages/conversations');
  }

  /**
   * Get messages in a conversation
   */
  async getMessages(conversationId: string) {
    return this.get(`/messages/${conversationId}`);
  }

  /**
   * Send a message
   */
  async sendMessage(recipientId: string, content: string, giveawayId?: string) {
    return this.post('/messages', { recipientId, content, giveawayId });
  }

  // ==================== NOTIFICATION ENDPOINTS ====================

  /**
   * Get notifications
   */
  async getNotifications(params?: { page?: number; limit?: number }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.get(`/notifications${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: string) {
    return this.patch(`/notifications/${notificationId}/read`);
  }

  // ==================== NGO ENDPOINTS ====================

  /**
   * Register as NGO (complete application)
   */
  async registerNGO(formData: FormData) {
    const response = await fetch(`${this.baseUrl}/ngo/register`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to register NGO');
    }

    return response.json();
  }

  /**
   * Apply for NGO status (existing user)
   */
  async applyForNGOStatus(data: FormData) {
    const response = await fetch(`${this.baseUrl}/ngo/apply`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
      body: data,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to apply for NGO status');
    }

    return response.json();
  }

  /**
   * Get NGO profile
   */
  async getNGOProfile() {
    return this.get('/ngo/profile');
  }

  /**
   * Get verified NGOs
   */
  async getVerifiedNGOs() {
    return this.get('/ngo/verified');
  }

  /**
   * Create NGO campaign
   */
  async createNGOCampaign(data: any) {
    return this.post('/ngo/campaigns', data);
  }

  /**
   * Get NGO campaigns
   */
  async getNGOCampaigns() {
    return this.get('/ngo/campaigns');
  }

  /**
   * Create bulk giveaways
   */
  async createBulkGiveaways(campaignId: string, giveaways: any[]) {
    return this.post(`/ngo/campaigns/${campaignId}/giveaways/bulk`, { giveaways });
  }

  /**
   * Create pickup point
   */
  async createPickupPoint(data: any) {
    return this.post('/ngo/pickup-points', data);
  }

  /**
   * Get pickup points
   */
  async getPickupPoints() {
    return this.get('/ngo/pickup-points');
  }

  /**
   * Verify pickup code
   */
  async verifyPickupCode(code: string) {
    return this.post('/ngo/pickup/verify', { code });
  }

  /**
   * Get NGO impact dashboard
   */
  async getNGOImpactDashboard() {
    return this.get('/ngo/dashboard');
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead() {
    return this.post('/notifications/read-all');
  }

  // ==================== NGO TRUST FRAMEWORK ENDPOINTS ====================

  /**
   * Get public NGO profile
   */
  async getNGOPublicProfile(ngoProfileId: string) {
    return this.get(`/ngo/trust/profile/${ngoProfileId}`);
  }

  /**
   * Submit transparency report
   */
  async submitTransparencyReport(data: any) {
    return this.post('/ngo/trust/transparency-report', data);
  }

  /**
   * Get my transparency reports
   */
  async getMyTransparencyReports() {
    return this.get('/ngo/trust/transparency-reports');
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export class for testing
export default ApiClient;

