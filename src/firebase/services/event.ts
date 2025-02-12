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


// src/firebase/services/events.ts
import { Event } from '@/types';

export const eventsRef = collection(db, 'events');

export const getEvents = async () => {
  const snapshot = await getDocs(eventsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Event[];
};

export const getEventById = async (id: string) => {
  const docRef = doc(db, 'events', id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Event : null;
};

export const createEvent = async (event: Omit<Event, 'id'>) => {
  const docRef = await addDoc(eventsRef, event);
  return { id: docRef.id, ...event };
};

export const updateEvent = async (id: string, data: Partial<Event>) => {
  const docRef = doc(db, 'events', id);
  await updateDoc(docRef, data);
  return { id, ...data };
};

export const deleteEvent = async (id: string) => {
  const docRef = doc(db, 'events', id);
  await deleteDoc(docRef);
};

