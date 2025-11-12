'use client';

import useSWR from 'swr';
import { Task } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useFocusTasks(limit = 5) {
  const { data, error, isLoading, mutate } = useSWR<{ tasks: Task[] }>(
    `/api/tasks/focus?limit=${limit}`,
    fetcher
  );

  return {
    tasks: data?.tasks || [],
    isLoading,
    isError: error,
    mutate,
  };
}
