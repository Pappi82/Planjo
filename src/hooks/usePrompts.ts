import useSWR from 'swr';
import { Prompt } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function usePrompts() {
  const { data, error, isLoading, mutate } = useSWR<{
    prompts: Prompt[];
  }>(
    '/api/prompts',
    fetcher
  );

  return {
    prompts: data?.prompts || [],
    isLoading,
    isError: error,
    mutate,
  };
}
