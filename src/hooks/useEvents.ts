
// src/hooks/useEvents.ts
"use client"
import { useState, useEffect } from 'react';
import { 
  getEvents, 
  getEventById, 
  createEvent, 
  updateEvent, 
  deleteEvent 
} from '@/firebase/services/event';

import { Event } from '@/types';
// import { useToast } from '@/components/ui/use-toast';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
//   const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch events');
      alert({
        title: 'Error',
        description: 'Failed to fetch events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getEvent = async (id: string) => {
    try {
      setLoading(true);
      const event = await getEventById(id);
      setError(null);
      return event;
    } catch (err) {
      setError('Failed to fetch event');
      alert({
        title: 'Error',
        description: 'Failed to fetch event details',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (eventData: Omit<Event, 'id'>) => {
    try {
      setLoading(true);
      const newEvent = await createEvent(eventData);
      setEvents(prev => [...prev, newEvent]);
      alert({
        title: 'Success',
        description: 'Event created successfully',
      });
      return newEvent;
    } catch (err) {
      setError('Failed to create event');
      alert({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const editEvent = async (id: string, data: Partial<Event>) => {
    try {
      setLoading(true);
      const updatedEvent = await updateEvent(id, data);
      setEvents(prev => 
        prev.map(event => 
          event.id === id ? { ...event, ...data } : event
        )
      );
      alert({
        title: 'Success',
        description: 'Event updated successfully',
      });
      return updatedEvent;
    } catch (err) {
      setError('Failed to update event');
      alert({
        title: 'Error',
        description: 'Failed to update event',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removeEvent = async (id: string) => {
    try {
      setLoading(true);
      await deleteEvent(id);
      setEvents(prev => prev.filter(event => event.id !== id));
      alert({
        title: 'Success',
        description: 'Event deleted successfully',
      });
      return true;
    } catch (err) {
      setError('Failed to delete event');
      alert({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    events,
    loading,
    error,
    getEvent,
    addEvent,
    editEvent,
    removeEvent,
    refreshEvents: fetchEvents,
  };
}
