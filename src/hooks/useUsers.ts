
// src/hooks/useUsers.ts
import { useState, useEffect } from 'react';
import { 
  getUsers,
  getUserById,
  createUser,
  updateUser,
} from '@/firebase/services/users';
import { User } from '@/types';
// import { useToast } from '@/components/ui/use-toast';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
//   const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      alert({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getUser = async (id: string) => {
    try {
      setLoading(true);
      const user = await getUserById(id);
      setError(null);
      return user;
    } catch (err) {
      setError('Failed to fetch user');
      alert({
        title: 'Error',
        description: 'Failed to fetch user details',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (userData: Omit<User, 'id'>) => {
    try {
      setLoading(true);
      const newUser = await createUser(userData);
      setUsers(prev => [...prev, newUser]);
      alert({
        title: 'Success',
        description: 'User created successfully',
      });
      return newUser;
    } catch (err) {
      setError('Failed to create user');
      alert({
        title: 'Error',
        description: 'Failed to create user',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const editUser = async (id: string, data: Partial<User>) => {
    try {
      setLoading(true);
      const updatedUser = await updateUser(id, data);
      setUsers(prev => 
        prev.map(user => 
          user.id === id ? { ...user, ...data } : user
        )
      );
      alert({
        title: 'Success',
        description: 'User updated successfully',
      });
      return updatedUser;
    } catch (err) {
      setError('Failed to update user');
      alert({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    getUser,
    addUser,
    editUser,
    refreshUsers: fetchUsers,
  };
}