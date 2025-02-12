
// src/hooks/useAnnouncements.ts
"use client"
import { useState, useEffect } from 'react';
import { 
  getAnnouncements, 
  createAnnouncement, 
  deleteAnnouncement 
} from '@/firebase/services/announcements';
import { Announcement } from '@/types';
// import { useToast } from '@/components/ui/use-toast';

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
//   const { toast } = useToast();

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
      alert({
        title: 'Error',
        description: 'Failed to fetch announcements',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addAnnouncement = async (announcementData: Omit<Announcement, 'id'>) => {
    try {
      setLoading(true);
      const newAnnouncement = await createAnnouncement(announcementData);
      setAnnouncements(prev => [...prev, newAnnouncement]);
      alert({
        title: 'Success',
        description: 'Announcement created successfully',
      });
      return newAnnouncement;
    } catch (err) {
      setError('Failed to create announcement');
      alert({
        title: 'Error',
        description: 'Failed to create announcement',
        variant: 'destructive',
      });
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
      alert({
        title: 'Success',
        description: 'Announcement deleted successfully',
      });
      return true;
    } catch (err) {
      setError('Failed to delete announcement');
      alert({
        title: 'Error',
        description: 'Failed to delete announcement',
        variant: 'destructive',
      });
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
