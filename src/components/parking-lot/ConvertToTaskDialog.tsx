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
      <DialogContent className="max-w-xl rounded-[24px] border-white/12 bg-slate-950/88">
        <DialogHeader>
          <DialogTitle>Convert idea to task</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 text-white">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            {item.description ? (
              <p className="text-sm text-white/60">{item.description}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Select project *</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="rounded-full border-white/20 bg-white/5 text-white/80">
                <SelectValue placeholder="Choose a project..." />
              </SelectTrigger>
              <SelectContent className="rounded-[20px] border border-white/10 bg-slate-950/95 text-white">
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
              <SelectTrigger className="rounded-full border-white/20 bg-white/5 text-white/80">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className="rounded-[20px] border border-white/10 bg-slate-950/95 text-white">
                {TASK_PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="rounded-full border-white/25 bg-white/5 text-white/80 hover:text-white">
              Cancel
            </Button>
            <Button onClick={handleConvert} disabled={!projectId || loading} className="rounded-full">
              {loading ? 'Converting…' : 'Convert to task'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
