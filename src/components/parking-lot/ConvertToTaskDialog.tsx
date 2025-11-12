'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IParkingLotItem } from '@/types';
import { useProjects } from '@/hooks/useProjects';
import { TASK_PRIORITIES } from '@/lib/constants';

interface ConvertToTaskDialogProps {
  item: IParkingLotItem | null;
  open: boolean;
  onClose: () => void;
  onConvert: (itemId: string, projectId: string, data: any) => Promise<void>;
}

export default function ConvertToTaskDialog({
  item,
  open,
  onClose,
  onConvert,
}: ConvertToTaskDialogProps) {
  const { projects } = useProjects();
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const handleConvert = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      await onConvert(item._id.toString(), projectId, { priority });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert to Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{item.title}</h3>
            {item.description && (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Select Project *</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project._id.toString()} value={project._id.toString()}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleConvert} disabled={!projectId || loading}>
              {loading ? 'Converting...' : 'Convert to Task'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
