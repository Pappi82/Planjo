'use client';

import { Project } from '@/types';
import { ProjectCard } from './ProjectCard';

interface ProjectGridProps {
  projects: Project[];
  onEdit?: (project: Project) => void;
  onArchive?: (project: Project) => void;
}

export function ProjectGrid({ projects, onEdit, onArchive }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="planjo-panel border border-dashed border-white/10 p-10 text-center text-white/60">
        No projects yet. Launch one to unlock your Planjo flow.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project._id.toString()}
          project={project}
          onEdit={onEdit}
          onArchive={onArchive}
        />
      ))}
    </div>
  );
}
