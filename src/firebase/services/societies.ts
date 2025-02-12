
// src/firebase/services/societies.ts
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
import { Society } from '@/types';

export const societiesRef = collection(db, 'societies');

export const getSocieties = async () => {
  const snapshot = await getDocs(societiesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Society[];
};

export const getSocietyById = async (id: string) => {
  const docRef = doc(db, 'societies', id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Society : null;
};

export const createSociety = async (society: Omit<Society, 'id'>) => {
  const docRef = await addDoc(societiesRef, society);
  return { id: docRef.id, ...society };
};

export const updateSociety = async (id: string, data: Partial<Society>) => {
  const docRef = doc(db, 'societies', id);
  await updateDoc(docRef, data);
  return { id, ...data };
};

export const deleteSociety = async (id: string) => {
  const docRef = doc(db, 'societies', id);
  await deleteDoc(docRef);
};
// src/firebase/services/announcements.ts
import { Announcement } from '@/types';

export const announcementsRef = collection(db, 'announcements');

export const getAnnouncements = async () => {
  const snapshot = await getDocs(announcementsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Announcement[];
};

export const createAnnouncement = async (announcement: Omit<Announcement, 'id'>) => {
  const docRef = await addDoc(announcementsRef, announcement);
  return { id: docRef.id, ...announcement };
};

export const deleteAnnouncement = async (id: string) => {
  const docRef = doc(db, 'announcements', id);
  await deleteDoc(docRef);
};
