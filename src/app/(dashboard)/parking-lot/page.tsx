'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import IdeaCard from '@/components/parking-lot/IdeaCard';
import ConvertToTaskDialog from '@/components/parking-lot/ConvertToTaskDialog';
import { IParkingLotItem } from '@/types';
import { Plus, Lightbulb } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ParkingLotPage() {
  const { data, mutate } = useSWR('/api/parking-lot', fetcher);
  const items = data?.items || [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IParkingLotItem | null>(null);
  const [convertItem, setConvertItem] = useState<IParkingLotItem | null>(null);
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
      tags: item.tags.join(', '),
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this idea?')) return;
    await fetch(`/api/parking-lot/${id}`, { method: 'DELETE' });
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
    <div className="space-y-8">
      <div className="planjo-panel flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-8">
        <div>
          <p className="planjo-pill text-white/70 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Idea buffer
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Parking Lot</h1>
          <p className="text-white/60">
            Capture sparks, rank them, and fire them into tasks whenever they feel ripe.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingItem(null);
              }}
            >
              <Plus className="h-4 w-4" />
              New idea
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit idea' : 'New idea'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="feature, bug, enhancement..."
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={editingItem ? handleUpdate : handleCreate}>
                  {editingItem ? 'Update' : 'Create'}
                </Button>
                <Button variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="planjo-panel border border-dashed border-white/10 p-12 text-center text-white/60">
          Drop your first idea. Planjo keeps it safe until you are ready to turn it into a task.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item: any) => (
            <IdeaCard
              key={item._id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onConvert={setConvertItem}
            />
          ))}
        </div>
      )}

      <ConvertToTaskDialog
        item={convertItem}
        open={!!convertItem}
        onClose={() => setConvertItem(null)}
        onConvert={handleConvert}
      />
    </div>
  );
}
