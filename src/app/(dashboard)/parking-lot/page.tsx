'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import IdeaCard from '@/components/parking-lot/IdeaCard';
import ConvertToTaskDialog from '@/components/parking-lot/ConvertToTaskDialog';
import { IParkingLotItem } from '@/types';
import { Plus, Lightbulb } from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { SectionSurface } from '@/components/layout/SectionSurface';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ParkingLotPage() {
  const { data, mutate } = useSWR('/api/parking-lot', fetcher);
  const items = data?.items || [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IParkingLotItem | null>(null);
  const [convertItem, setConvertItem] = useState<IParkingLotItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<IParkingLotItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    tags: '',
  });

  const handleCreate = async () => {
    if (!formData.title.trim()) return;

    await fetch('/api/parking-lot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      }),
    });

    setFormData({ title: '', description: '', priority: 'medium', tags: '' });
    setDialogOpen(false);
    mutate();
  };

  const handleEdit = (item: IParkingLotItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      priority: item.priority,
      tags: item.tags?.join(', ') || '',
    });
    setDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingItem || !formData.title.trim()) return;

    await fetch(`/api/parking-lot/${editingItem._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      }),
    });

    setFormData({ title: '', description: '', priority: 'medium', tags: '' });
    setEditingItem(null);
    setDialogOpen(false);
    mutate();
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    await fetch(`/api/parking-lot/${pendingDelete._id}`, { method: 'DELETE' });
    setPendingDelete(null);
    mutate();
  };

  const handleConvert = async (itemId: string, projectId: string, data: any) => {
    await fetch(`/api/parking-lot/${itemId}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, ...data }),
    });
    mutate();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData({ title: '', description: '', priority: 'medium', tags: '' });
  };

  return (
    <div className="space-y-10">
      <PageHero
        label="Idea buffer"
        title="Parking Lot"
        description="Capture sparks, rank them, and launch them into tasks whenever they feel ripe."
        highlight={
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.35em] text-white/60">
            <Lightbulb className="h-3.5 w-3.5" />
            {items.length} stored ideas
          </span>
        }
        actions={
          <Button
            onClick={() => {
              setEditingItem(null);
              setDialogOpen(true);
            }}
            className="rounded-full"
          >
            <Plus className="h-4 w-4" />
            Capture idea
          </Button>
        }
      />

      <SectionSurface
        title="Idea backlog"
        description="Drag from your mind and drop them here. Every idea gets a seat until it is ready to orbit into a project."
      >
        {items.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-white/12 bg-white/[0.03] text-white/60">
            <span className="text-sm">Drop your first idea. Planjo keeps it safe until it is task-ready.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item: IParkingLotItem) => (
              <IdeaCard
                key={item._id.toString()}
                item={item}
                onEdit={handleEdit}
                onDelete={(id) => {
                  const target = items.find((entry: IParkingLotItem) => entry._id.toString() === id);
                  if (target) setPendingDelete(target);
                }}
                onConvert={setConvertItem}
              />
            ))}
          </div>
        )}
      </SectionSurface>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit idea' : 'Capture an idea'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter idea title..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your idea..."
                rows={4}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="feature, bug, experiment..."
                />
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button onClick={editingItem ? handleUpdate : handleCreate}>
                {editingItem ? 'Update idea' : 'Save idea'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConvertToTaskDialog
        item={convertItem}
        open={!!convertItem}
        onClose={() => setConvertItem(null)}
        onConvert={handleConvert}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(next) => {
          if (!next) setPendingDelete(null);
        }}
        title="Delete idea"
        description={
          pendingDelete
            ? `Delete "${pendingDelete.title}" from your parking lot? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Keep idea"
        tone="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}
