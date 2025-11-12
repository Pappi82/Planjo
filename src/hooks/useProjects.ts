import useSWR from 'swr';
import { Project, ProjectDashboardStat } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface UseProjectsOptions {
  archived?: boolean;
  withStats?: boolean;
}

type UseProjectsParam = boolean | UseProjectsOptions | undefined;

export function useProjects(param?: UseProjectsParam) {
  let options: UseProjectsOptions = {};

  if (typeof param === 'boolean') {
    options.archived = param;
  } else if (param) {
    options = param;
  }

  const { archived = false, withStats = false } = options;

  const query = new URLSearchParams({ archived: String(archived) });
  if (withStats) {
    query.append('withStats', 'true');
  }

  const { data, error, isLoading, mutate } = useSWR<{
    projects: Project[];
    stats?: ProjectDashboardStat[];
  }>(
    `/api/projects?${query.toString()}`,
    fetcher
  );

  return {
    projects: data?.projects || [],
    stats: data?.stats || [],
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
