'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTask } from '@/hooks/useTasks';
import VibeContainer from '@/components/vibe/VibeContainer';
import { Loader2 } from 'lucide-react';

export default function VibeModePage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;

  const { task, isLoading, mutate } = useTask(taskId);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!task) {
    router.push('/');
    return null;
  }

  const handleComplete = async () => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completedAt: new Date().toISOString() }),
    });
    mutate();
    router.back();
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <VibeContainer
      task={task}
      onClose={handleClose}
      onComplete={handleComplete}
    />
  );
}
