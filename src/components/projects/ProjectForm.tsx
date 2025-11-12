'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Project } from '@/types';
import { PROJECT_STATUS_OPTIONS, PROJECT_COLORS, TECH_STACK_OPTIONS, ProjectStatus } from '@/lib/constants';
import { cn } from '@/lib/utils';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'on-hold', 'completed']),
  color: z.string(),
  techStack: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel: () => void;
}

export function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedTech, setSelectedTech] = useState<string[]>(project?.techStack || []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      status: (project?.status as ProjectStatus) || 'planning',
      color: project?.color || PROJECT_COLORS[0].value,
      techStack: project?.techStack || [],
      startDate: project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project?.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
    },
  });

  const selectedColor = watch('color');
  const selectedStatus = watch('status');

  useEffect(() => {
    setValue('techStack', selectedTech);
  }, [selectedTech, setValue]);

  const handleFormSubmit = async (data: ProjectFormData) => {
    setLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  const toggleTech = (tech: string) => {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Project Name *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="My next big build"
          disabled={loading}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="What is this project about?"
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={selectedStatus}
            onValueChange={(value) => setValue('status', value as ProjectStatus)}
            disabled={loading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose flow" />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-white/60">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Color</Label>
          <div className="flex flex-wrap gap-3">
            {PROJECT_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                className={cn(
                  'h-10 w-10 rounded-2xl border-2 transition',
                  selectedColor === color.value
                    ? 'border-white shadow-[0_0_25px_rgba(255,255,255,0.4)]'
                    : 'border-transparent opacity-70 hover:opacity-100'
                )}
                style={{ backgroundColor: color.value }}
                onClick={() => setValue('color', color.value)}
                disabled={loading}
                title={color.label}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tech Stack</Label>
        <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-2xl border border-white/10 p-3">
          {TECH_STACK_OPTIONS.map((tech) => (
            <button
              key={tech}
              type="button"
              onClick={() => toggleTech(tech)}
              className={cn(
                'rounded-full px-4 py-1 text-sm transition',
                selectedTech.includes(tech)
                  ? 'bg-white text-[#05060f]'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              )}
              disabled={loading}
            >
              {tech}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" type="date" {...register('startDate')} disabled={loading} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input id="endDate" type="date" {...register('endDate')} disabled={loading} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}
