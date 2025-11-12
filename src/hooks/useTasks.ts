import useSWR from 'swr';
import { ITask, IKanbanColumn } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTask(taskId: string) {
  const { data, error, mutate } = useSWR(
    taskId ? `/api/tasks/${taskId}` : null,
    fetcher
  );

  return {
    task: data?.task as ITask | undefined,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useTasks(projectId?: string) {
  const { data, error, mutate } = useSWR(
    projectId ? `/api/tasks?projectId=${projectId}` : null,
    fetcher
  );

  return {
    tasks: (data?.tasks as ITask[]) || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useColumns(projectId?: string) {
  const { data, error, mutate } = useSWR(
    projectId ? `/api/columns?projectId=${projectId}` : null,
    fetcher
  );

  return {
    columns: (data?.columns as IKanbanColumn[]) || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
