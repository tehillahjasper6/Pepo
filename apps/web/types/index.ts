/**
 * Common TypeScript Interfaces for API responses and data types
 */

// Auth & User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface GiveawayResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  image?: string;
  creatorId: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

export interface GiveawayListResponse {
  giveaways: GiveawayResponse[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
  };
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface FilterParams {
  [key: string]: string | number | boolean;
}

export interface MessageResponse {
  id: string;
  senderId: string;
  giveawayId: string;
  content: string;
  createdAt: string;
}

export interface NotificationResponse {
  id: string;
  userId: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface NGOProfileResponse {
  id: string;
  name: string;
  description: string;
  status: string;
  verificationStatus: string;
}

export interface BadgeResponse {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface TrustScoreResponse {
  score: number;
  level: string;
  breakdown: Record<string, number>;
}

export interface OfflineItem {
  id: string;
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
  synced: boolean;
}
