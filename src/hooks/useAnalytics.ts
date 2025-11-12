'use client';

import useSWR from 'swr';
import { AnalyticsSnapshot } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface UseAnalyticsOptions {
  days?: number;
  shouldFetch?: boolean;
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { days = 30, shouldFetch = true } = options;
  const endpoint = shouldFetch ? `/api/analytics?days=${days}` : null;

  const { data, error, isLoading, mutate } = useSWR<AnalyticsSnapshot>(
    endpoint,
    fetcher
  );

  return {
    analytics: data,
    isLoading,
    isError: error,
    mutate,
  };
}
