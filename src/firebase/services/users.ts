
// src/firebase/services/users.ts
import { User } from '@/types';
import { db } from '../config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';


export const usersRef = collection(db, 'users');

export const getUsers = async () => {
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
};

export const getUserById = async (id: string) => {
  const docRef = doc(db, 'users', id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as User : null;
};

export const createUser = async (user: Omit<User, 'id'>) => {
  const docRef = await addDoc(usersRef, user);
  return { id: docRef.id, ...user };
};

export const updateUser = async (id: string, data: Partial<User>) => {
  const docRef = doc(db, 'users', id);
  await updateDoc(docRef, data);
  return { id, ...data };
};