import { useState } from 'react';
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { useLiveQuery } from 'dexie-react-hooks';

export function useForecasts() {
  const { user } = useAuth();
  const [error] = useState<Error | null>(null);

  const forecasts = useLiveQuery(
    () => {
      if (!user) return [];
      return db.forecasts.where('userId').equals(user.id).reverse().sortBy('createdAt');
    },
    [user],
    []
  );

  const isLoading = forecasts === undefined && user !== null;

  return {
    forecasts: forecasts || [],
    isLoading,
    error,
  };
}
