import useSWR from 'swr';
import { Project } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useProjects(archived = false) {
  const { data, error, isLoading, mutate } = useSWR<{ projects: Project[] }>(
    `/api/projects?archived=${archived}`,
    fetcher
  );

  return {
    projects: data?.projects || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useProject(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<{ project: Project }>(
    id ? `/api/projects/${id}` : null,
    fetcher
  );

  return {
    project: data?.project,
    isLoading,
    isError: error,
    mutate,
  };
}

