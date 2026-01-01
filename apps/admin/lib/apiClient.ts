/**
 * API Client for PEPO Admin Panel
 * Handles all HTTP requests to the backend with admin authentication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt?: string;
  [key: string]: unknown;
}

interface NGOApplication {
  id: string;
  ngoProfileId: string;
  organizationName: string;
  status: string;
  [key: string]: unknown;
}

interface Report {
  id: string;
  type: string;
  status: string;
  [key: string]: unknown;
}

interface AuditLog {
  id: string;
  entityType: string;
  action: string;
  [key: string]: unknown;
}

interface TransparencyReport {
  id: string;
  [key: string]: unknown;
}

class AdminApiClient {
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

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized. Please log in again.');
    }

    if (response.status === 403) {
      throw new Error('You do not have permission to perform this action.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    body?: Record<string, unknown>,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(
    endpoint: string,
    body?: Record<string, unknown>,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * Get platform statistics
   */
  async getStats() {
    return this.get<{
      totalUsers: number;
      totalGiveaways: number;
      totalNGOs: number;
      totalWinners: number;
      recentUsers: number;
      activeGiveaways: number;
    }>('/admin/stats');
  }

  /**
   * Get all users
   */
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<{ users: User[]; pagination: Record<string, unknown> }> {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = params.page.toString();
    if (params?.limit) queryParams.limit = params.limit.toString();
    if (params?.search) queryParams.search = params.search;
    if (params?.role) queryParams.role = params.role;
    if (params?.status) queryParams.status = params.status;

    const queryString = new URLSearchParams(queryParams).toString();
    return this.get<{ users: User[]; pagination: Record<string, unknown> }>(
      `/admin/users${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Update user status (activate/deactivate)
   */
  async updateUserStatus(userId: string, status: 'ACTIVE' | 'INACTIVE' | 'BANNED') {
    return this.put(`/admin/users/${userId}/status`, { status });
  }

  /**
   * Get pending NGO applications
   */
  async getPendingNGOs(): Promise<{ ngos: NGOApplication[] }> {
    return this.get<{ ngos: NGOApplication[] }>('/admin/ngo/pending');
  }

  /**
   * Verify an NGO
   */
  async verifyNGO(ngoId: string) {
    return this.post(`/admin/ngo/${ngoId}/verify`);
  }

  /**
   * Reject an NGO application
   */
  async rejectNGO(ngoId: string, reason: string) {
    return this.post(`/admin/ngo/${ngoId}/reject`, { reason });
  }

  /**
   * Get all reports
   */
  async getReports(params?: {
    page?: number;
    limit?: number;
    status?: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  }): Promise<{ reports: Report[]; pagination: Record<string, unknown> }> {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = params.page.toString();
    if (params?.limit) queryParams.limit = params.limit.toString();
    if (params?.status) queryParams.status = params.status;

    const queryString = new URLSearchParams(queryParams).toString();
    return this.get<{ reports: Report[]; pagination: Record<string, unknown> }>(
      `/admin/reports${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Resolve a report
   */
  async resolveReport(reportId: string, resolution: string) {
    return this.post(`/admin/reports/${reportId}/resolve`, { resolution });
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    entityType?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ logs: AuditLog[]; pagination: Record<string, unknown> }> {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = params.page.toString();
    if (params?.limit) queryParams.limit = params.limit.toString();
    if (params?.entityType) queryParams.entityType = params.entityType;
    if (params?.action) queryParams.action = params.action;
    if (params?.startDate) queryParams.startDate = params.startDate;
    if (params?.endDate) queryParams.endDate = params.endDate;

    const queryString = new URLSearchParams(queryParams).toString();
    return this.get<{ logs: AuditLog[]; pagination: Record<string, unknown> }>(
      `/admin/audit-logs${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get pending transparency reports
   */
  async getPendingTransparencyReports(): Promise<{ reports: TransparencyReport[] }> {
    return this.get<{ reports: TransparencyReport[] }>('/admin/transparency-reports/pending');
  }

  /**
   * Review transparency report
   */
  async reviewTransparencyReport(
    reportId: string,
    action: 'APPROVE' | 'REJECT',
    reviewNotes?: string,
    rejectionReason?: string
  ) {
    return this.post(`/admin/transparency-reports/${reportId}/review`, {
      action,
      reviewNotes,
      rejectionReason,
    });
  }
}

// Export singleton instance
export const adminApiClient = new AdminApiClient(API_BASE_URL);

// Export class for testing
export default AdminApiClient;

