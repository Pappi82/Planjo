'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProjectGrid } from '@/components/projects/ProjectGrid';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/types';
import { usePlanjoSound } from '@/components/providers/PlanjoExperienceProvider';
import { PageHero } from '@/components/layout/PageHero';
import { SectionSurface } from '@/components/layout/SectionSurface';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function ProjectsPage() {
  const { projects, isLoading, mutate } = useProjects();
  const { play } = usePlanjoSound();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [pendingArchive, setPendingArchive] = useState<Project | null>(null);

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

  const handleArchiveProject = async () => {
    if (!pendingArchive) return;
    play('action');
    try {
      const response = await fetch(`/api/projects/${pendingArchive._id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to archive project');
      await mutate();
      setPendingArchive(null);
    } catch (error) {
      console.error('Error archiving project:', error);
      alert('Failed to archive project');
    }
  };

  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setIsEditDialogOpen(true);
  };

  const activeCount = useMemo(
    () => projects.filter((project) => project.status === 'active').length,
    [projects]
  );

  return (
    <div className="space-y-10">
      <PageHero
        label="Projects"
        title="Launchpads"
        actions={
          <Button
            onClick={() => {
              play('action');
              setIsCreateDialogOpen(true);
            }}
            className="self-start rounded-full"
          >
            <Plus className="h-4 w-4" />
            Launch project
          </Button>
        }
      />

      <SectionSurface
        title="Your constellation"
      >
        {isLoading ? (
          <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-white/12 bg-white/[0.03] text-white/60">
            <span className="text-sm">Loading current initiatives...</span>
          </div>
        ) : (
          <ProjectGrid
            projects={projects}
            onEdit={openEditDialog}
            onArchive={(project) => setPendingArchive(project)}
          />
        )}
      </SectionSurface>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <ProjectForm onSubmit={handleCreateProject} onCancel={() => setIsCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
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

      <ConfirmDialog
        open={!!pendingArchive}
        onOpenChange={(next) => {
          if (!next) setPendingArchive(null);
        }}
        title="Archive project"
        description={
          pendingArchive
            ? `Archive "${pendingArchive.title}"? You can restore it later from the vault.`
            : ''
        }
        confirmLabel="Archive"
        cancelLabel="Keep project"
        tone="danger"
        onConfirm={handleArchiveProject}
      />
    </div>
  );
}
