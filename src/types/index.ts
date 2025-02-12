// src/types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'society_head' | 'member';
  societyId?: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
  isActive?: boolean;
  metadata?: {
    department?: string;
    year?: number;
    contactNumber?: string;
  };
}

export interface Society {
  id: string;
  name: string;
  description: string;
  headId: string;
  members: string[];
  events: string[];
  logo?: string;
  coverImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
  socialLinks?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  metadata?: {
    memberCount?: number;
    eventCount?: number;
    establishedYear?: number;
  };
  status?: 'active' | 'inactive' | 'suspended';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  venue: string;
  societyId: string;
  maxParticipants: number;
  registeredParticipants: string[];
  banner?: string;
  createdAt?: Date;
  updatedAt?: Date;
  endDate?: Date;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  type?: 'workshop' | 'seminar' | 'competition' | 'social' | 'other';
  registrationDeadline?: Date;
  fees?: {
    amount: number;
    currency: string;
  };
  organizers?: string[];
  contacts?: {
    name: string;
    role: string;
    email: string;
    phone?: string;
  }[];
  metadata?: {
    attendanceCount?: number;
    rating?: number;
    feedback?: number;
  };
}

// Re-export Announcement type
export type { Announcement } from './announcement';

// Common types used across the application
export type Role = 'admin' | 'society_head' | 'member';

export interface BaseResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends BaseResponse {
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}