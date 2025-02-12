// src/types/announcement.ts

export interface Announcement {
    id: string;
    title: string;
    content: string;
    societyId: string;
    authorId: string;
    createdAt: Date;
    updatedAt?: Date;
    isPublic: boolean;
    isPinned?: boolean;
    attachments?: {
      url: string;
      name: string;
      type: string;
    }[];
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
    status?: 'draft' | 'published' | 'archived';
    targetAudience?: {
      roles?: ('admin' | 'society_head' | 'member')[];
      societies?: string[];
      years?: number[];
    };
    metadata?: {
      views?: number;
      likes?: number;
      comments?: number;
    };
  }
  
  export interface AnnouncementFilter {
    societyId?: string;
    isPublic?: boolean;
    isPinned?: boolean;
    status?: 'draft' | 'published' | 'archived';
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
    startDate?: Date;
    endDate?: Date;
    searchTerm?: string;
  }
  
  export interface AnnouncementSort {
    field: 'createdAt' | 'updatedAt' | 'priority' | 'views' | 'likes';
    direction: 'asc' | 'desc';
  }