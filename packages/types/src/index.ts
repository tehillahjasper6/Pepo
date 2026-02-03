// User Types
export enum UserRole {
  USER = 'USER',
  NGO = 'NGO',
  ADMIN = 'ADMIN',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  city?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

// Giveaway Types
export enum GiveawayStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum EligibilityGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  ALL = 'ALL',
}

export interface Giveaway {
  id: string;
  userId: string;
  title: string;
  description: string;
  images: string[];
  category?: string;
  location: string;
  eligibilityGender: EligibilityGender;
  quantity: number;
  status: GiveawayStatus;
  publishedAt?: Date;
  expiresAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  user?: User;
  participantCount?: number;
  hasParticipated?: boolean;
  isWinner?: boolean;
}

// Participant Types
export enum ParticipantStatus {
  INTERESTED = 'INTERESTED',
  SELECTED = 'SELECTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export interface Participant {
  id: string;
  userId: string;
  giveawayId: string;
  status: ParticipantStatus;
  createdAt: Date;
  user?: User;
}

// Winner Types
export interface Winner {
  id: string;
  giveawayId: string;
  userId: string;
  selectedAt: Date;
  pickupCode?: string;
}

// Message Types
export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
}

export interface Message {
  id: string;
  giveawayId: string;
  senderId: string;
  receiverId: string;
  content: string;
  status: MessageStatus;
  readAt?: Date;
  createdAt: Date;
  sender?: User;
}

// Notification Types
export enum NotificationType {
  WINNER_SELECTED = 'WINNER_SELECTED',
  DRAW_CLOSED = 'DRAW_CLOSED',
  NEW_MESSAGE = 'NEW_MESSAGE',
  GIVEAWAY_REMINDER = 'GIVEAWAY_REMINDER',
  NGO_VERIFIED = 'NGO_VERIFIED',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

// NGO Types
export enum NGOStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export interface NGOProfile {
  id: string;
  userId: string;
  organizationName: string;
  registrationNumber: string;
  description?: string;
  logo?: string;
  website?: string;
  status: NGOStatus;
  verifiedAt?: Date;
  createdAt: Date;
}

export interface Campaign {
  id: string;
  ngoProfileId: string;
  title: string;
  description: string;
  slug: string;
  coverImage?: string;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}




