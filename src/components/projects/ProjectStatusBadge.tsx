'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PROJECT_STATUSES, ProjectStatus } from '@/lib/constants';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectStatusBadgeProps {
  projectId: string;
  currentStatus: ProjectStatus;
  onStatusChange?: () => void;
}

export function ProjectStatusBadge({
  projectId,
  currentStatus,
  onStatusChange,
}: ProjectStatusBadgeProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const statusInfo = PROJECT_STATUSES[currentStatus] || PROJECT_STATUSES.planning;

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (newStatus === currentStatus || isUpdating) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      // Call the callback to refresh data
      onStatusChange?.();
    } catch (error) {
      console.error('Error updating project status:', error);
      alert('Failed to update project status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'group flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all hover:scale-105',
            'focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-[#02030a]',
            isUpdating && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            borderColor: `${statusInfo.color}55`,
            backgroundColor: `${statusInfo.color}15`,
            color: statusInfo.color,
          }}
          disabled={isUpdating}
        >
          <span className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: statusInfo.color }}
            />
            {statusInfo.label}
          </span>
          <ChevronDown className="h-3 w-3 opacity-60 transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56 rounded-2xl border border-white/15 bg-[#0a0b14]/95 p-2 backdrop-blur-xl"
      >
        {Object.entries(PROJECT_STATUSES).map(([value, info]) => (
          <DropdownMenuItem
            key={value}
            onClick={() => handleStatusChange(value as ProjectStatus)}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
              'focus:bg-white/10',
              currentStatus === value && 'bg-white/5'
            )}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: info.color }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">{info.label}</span>
              <span className="text-xs text-white/50">{info.description}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

