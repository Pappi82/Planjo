'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProjectGrid } from '@/components/projects/ProjectGrid';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/types';
import { usePlanjoSound } from '@/components/providers/PlanjoExperienceProvider';

export default function ProjectsPage() {
  const { projects, isLoading, mutate } = useProjects();
  const { play } = usePlanjoSound();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleCreateProject = async (data: any) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create project');
      await mutate();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    }
  };

  const handleEditProject = async (data: any) => {
    if (!selectedProject) return;
    try {
      const response = await fetch(`/api/projects/${selectedProject._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update project');
      await mutate();
      setIsEditDialogOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project');
    }
  };

  const handleArchiveProject = async (project: Project) => {
    if (!confirm(`Are you sure you want to archive "${project.title}"?`)) return;
    try {
      const response = await fetch(`/api/projects/${project._id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to archive project');
      await mutate();
    } catch (error) {
      console.error('Error archiving project:', error);
      alert('Failed to archive project');
    }
  };

  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="planjo-panel flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="planjo-pill text-white/70">Projects</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Launchpads</h1>
          <p className="text-white/60">
            Curate active bets, drag tickets, and keep your solo pipeline addictive.
          </p>
        </div>
        <Button
          onClick={() => {
            play('action');
            setIsCreateDialogOpen(true);
          }}
          className="self-start"
        >
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </div>

      <div>
        {isLoading ? (
          <div className="planjo-panel border border-white/10 p-10 text-center text-white/60">
            Loading current initiatives...
          </div>
        ) : (
          <ProjectGrid projects={projects} onEdit={openEditDialog} onArchive={handleArchiveProject} />
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <ProjectForm onSubmit={handleCreateProject} onCancel={() => setIsCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <ProjectForm
            project={selectedProject}
            onSubmit={handleEditProject}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setSelectedProject(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
