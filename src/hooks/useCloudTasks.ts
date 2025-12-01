'use client';

import useSWR from 'swr';
import { Task, Project } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const CLOUD_TASKS_KEY = '/api/tasks?isCloudTask=true&limit=10';

export function useCloudTasks(limit = 10) {
  const { data, error, isLoading, mutate } = useSWR<{ tasks: (Task & { project?: Project })[] }>(
    `/api/tasks?isCloudTask=true&limit=${limit}`,
    fetcher
  );

  return {
    tasks: data?.tasks || [],
    isLoading,
    isError: error,
    mutate,
  };
}

