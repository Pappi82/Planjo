'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';

interface DocumentCreateProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
  onCreate: (data: { title: string; content: string }) => Promise<void>;
}

export default function DocumentCreate({
  projectId,
  open,
  onClose,
  onCreate,
}: DocumentCreateProps) {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        content: '',
      });
      setTitle('');
      onClose();
    } catch (error) {
      console.error('Error creating document:', error);
      alert('Failed to create document. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="border-white/20 bg-[#0a0a0a]/95 text-white backdrop-blur-xl sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-[#38f8c7]" />
            Create New Document
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-white/80">
              Document Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title..."
              className="rounded-[20px] border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-[#38f8c7]/50 focus:ring-[#38f8c7]/20"
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-full border-white/25 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="rounded-full bg-gradient-to-r from-[#38f8c7] to-[#4ecbff] text-black hover:opacity-90"
            >
              {isSubmitting ? 'Creating...' : 'Create Document'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

