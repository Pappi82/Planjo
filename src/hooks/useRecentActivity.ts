'use client';

import useSWR from 'swr';
import { ActivityLog } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useRecentActivity(limit = 6) {
  const { data, error, isLoading, mutate } = useSWR<{ activities: ActivityLog[] }>(
    `/api/activity?limit=${limit}`,
    fetcher
  );

  return {
    activities: data?.activities || [],
    isLoading,
    isError: error,
    mutate,
  };
}
