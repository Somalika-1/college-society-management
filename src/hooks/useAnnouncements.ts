// src/hooks/useAnnouncements.ts
"use client"
import { useState, useEffect } from 'react';
import { 
  getAnnouncements, 
  createAnnouncement, 
  deleteAnnouncement 
} from '@/firebase/services/announcements';
import { Announcement } from '@/types';

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await getAnnouncements();
      setAnnouncements(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch announcements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addAnnouncement = async (announcementData: Omit<Announcement, 'id'>) => {
    try {
      setLoading(true);
      const newAnnouncement = await createAnnouncement(announcementData);
      setAnnouncements(prev => [...prev, newAnnouncement]);
      setError(null);
      return newAnnouncement;
    } catch (err) {
      setError('Failed to create announcement');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removeAnnouncement = async (id: string) => {
    try {
      setLoading(true);
      await deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
      setError(null);
      return true;
    } catch (err) {
      setError('Failed to delete announcement');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    announcements,
    loading,
    error,
    addAnnouncement,
    removeAnnouncement,
    refreshAnnouncements: fetchAnnouncements,
  };
}