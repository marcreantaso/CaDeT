import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type RealtimePayload = {
  new: any;
  old: any;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
};

interface UseRealtimeSubscriptionProps {
  table: string;
  onUpdate: (payload: RealtimePayload) => void;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  filter?: string;
}

/**
 * A custom hook to listen to Supabase Postgres changes in real-time.
 * Ensures channels are properly subscribed and cleaned up to prevent memory leaks.
 */
export function useRealtimeSubscription({
  table,
  onUpdate,
  event = '*',
  schema = 'public',
  filter,
}: UseRealtimeSubscriptionProps) {
  useEffect(() => {
    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      // Create a unique channel name based on params
      const channelName = `realtime:${schema}:${table}:${filter || 'all'}`;
      
      channel = supabase.channel(channelName);

      channel
        .on(
          'postgres_changes' as any, // Supabase TS types can be finicky here depending on version
          {
            event,
            schema,
            table,
            filter,
          },
          (payload) => {
            onUpdate(payload as any);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Subscribed to real-time changes on ${table}`);
          }
          if (status === 'CHANNEL_ERROR') {
            console.error(`Error subscribing to ${table}`);
          }
        });
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
        console.log(`Unsubscribed from real-time changes on ${table}`);
      }
    };
  }, [table, event, schema, filter, onUpdate]);
}
