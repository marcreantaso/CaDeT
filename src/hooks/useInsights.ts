import { useState } from 'react';
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { useLiveQuery } from 'dexie-react-hooks';

export function useInsights() {
  const { user } = useAuth();
  const [error, setError] = useState<Error | null>(null);

  const insights = useLiveQuery(
    () => {
      if (!user) return [];
      return db.insights.where('userId').equals(user.id).reverse().sortBy('createdAt');
    },
    [user],
    []
  );

  const isLoading = insights === undefined && user !== null;

  const markAsRead = async (id: string) => {
    try {
      await db.insights.update(id, {
        isRead: true,
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const unread = await db.insights.where('userId').equals(user.id).filter(i => !i.isRead).toArray();
      await db.insights.bulkUpdate(unread.map(i => ({ key: i.id, changes: { isRead: true } })));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    insights: insights || [],
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
  };
}
