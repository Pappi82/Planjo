'use client';

import Link from 'next/link';
import { MoreVertical, Calendar, Code } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Project } from '@/types';
import { PROJECT_STATUSES, ProjectStatus } from '@/lib/constants';
import dayjs from 'dayjs';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onArchive?: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onArchive }: ProjectCardProps) {
  const statusInfo =
    PROJECT_STATUSES[(project.status as ProjectStatus) || 'planning'] ||
    { label: 'Unknown', color: '#6B7280' };

  return (
    <Card className="group relative overflow-hidden border-white/5 bg-white/5 p-0 transition hover:border-white/20 hover:bg-white/10">
      <div
        className="absolute inset-0 opacity-10 blur-3xl"
        style={{ background: `radial-gradient(circle at 20% 20%, ${project.color || '#8c6ff7'}, transparent 60%)` }}
      />
      <Link href={`/projects/${project._id}/board`} className="relative block p-6">
        <CardHeader className="px-0 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-white"
                style={{ backgroundColor: `${(project.color || '#8c6ff7')}22` }}
              >
                <FolderKanbanIcon />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate text-lg font-semibold text-white group-hover:text-[#38f8c7]">
                  {project.name}
                </CardTitle>
                <CardDescription className="mt-1 line-clamp-2 text-white/60">
                  {project.description || 'No description yet'}
                </CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-white/60 hover:text-white">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px]">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    onEdit?.(project);
                  }}
                >
                  Edit details
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    onArchive?.(project);
                  }}
                >
                  Archive project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-0">
          <div className="flex items-center gap-2">
            <Badge
              style={{
                borderColor: `${statusInfo.color}55`,
                color: statusInfo.color,
              }}
              className="bg-transparent"
            >
              {statusInfo.label}
            </Badge>
          </div>

          {project.techStack && project.techStack.length > 0 && (
            <div className="flex items-start gap-2 text-sm text-white/60">
              <Code className="h-4 w-4 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {project.techStack.slice(0, 3).map((tech) => (
                  <span key={tech} className="rounded-full bg-white/10 px-3 py-0.5 text-xs text-white/80">
                    {tech}
                  </span>
                ))}
                {project.techStack.length > 3 && (
                  <span className="rounded-full bg-white/5 px-3 py-0.5 text-xs text-white/60">
                    +{project.techStack.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {(project.startDate || project.endDate) && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Calendar className="h-4 w-4" />
              <span>
                {project.startDate ? dayjs(project.startDate).format('MMM D, YYYY') : 'TBD'}
              </span>
              <span>→</span>
              <span>
                {project.endDate ? dayjs(project.endDate).format('MMM D, YYYY') : 'Open'}
              </span>
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}

function FolderKanbanIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="13" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 6l2 3 2-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
