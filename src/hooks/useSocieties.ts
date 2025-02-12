// src/hooks/useSocieties.ts
"use client"
import { useState, useEffect } from 'react';
import { 
  getSocieties, 
  getSocietyById, 
  createSociety, 
  updateSociety, 
  deleteSociety 
} from '@/firebase/services/societies';
import { Society } from '@/types';
// import { useToast } from '@/components/ui/use-toast';

export function useSocieties() {
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
//   const { toast } = useToast();

  useEffect(() => {
    fetchSocieties();
  }, []);

  const fetchSocieties = async () => {
    try {
      setLoading(true);
      const data = await getSocieties();
      setSocieties(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch societies');
      alert({
        title: 'Error',
        description: 'Failed to fetch societies',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSociety = async (id: string) => {
    try {
      setLoading(true);
      const society = await getSocietyById(id);
      setError(null);
      return society;
    } catch (err) {
      setError('Failed to fetch society');
      alert({
        title: 'Error',
        description: 'Failed to fetch society details',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addSociety = async (societyData: Omit<Society, 'id'>) => {
    try {
      setLoading(true);
      const newSociety = await createSociety(societyData);
      setSocieties(prev => [...prev, newSociety]);
      alert({
        title: 'Success',
        description: 'Society created successfully',
      });
      return newSociety;
    } catch (err) {
      setError('Failed to create society');
      alert({
        title: 'Error',
        description: 'Failed to create society',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const editSociety = async (id: string, data: Partial<Society>) => {
    try {
      setLoading(true);
      const updatedSociety = await updateSociety(id, data);
      setSocieties(prev => 
        prev.map(society => 
          society.id === id ? { ...society, ...data } : society
        )
      );
      alert({
        title: 'Success',
        description: 'Society updated successfully',
      });
      return updatedSociety;
    } catch (err) {
      setError('Failed to update society');
      alert({
        title: 'Error',
        description: 'Failed to update society',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removeSociety = async (id: string) => {
    try {
      setLoading(true);
      await deleteSociety(id);
      setSocieties(prev => prev.filter(society => society.id !== id));
      alert({
        title: 'Success',
        description: 'Society deleted successfully',
      });
      return true;
    } catch (err) {
      setError('Failed to delete society');
      alert({
        title: 'Error',
        description: 'Failed to delete society',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    societies,
    loading,
    error,
    getSociety,
    addSociety,
    editSociety,
    removeSociety,
    refreshSocieties: fetchSocieties,
  };
}
