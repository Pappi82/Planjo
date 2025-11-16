'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IVaultFile } from '@/types';
import { Upload, FileText } from 'lucide-react';

interface FileFormProps {
  file?: IVaultFile & { decryptedContent?: string };
  projectId: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function FileForm({
  file,
  projectId,
  open,
  onClose,
  onSubmit,
}: FileFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    filename: file?.filename || '',
    content: file ? (file as any).decryptedContent || '' : '',
    notes: file?.notes || '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      const text = await selectedFile.text();
      setFormData({
        ...formData,
        filename: selectedFile.name,
        content: text,
      });
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Failed to read file. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        projectId,
        filename: formData.filename,
        content: formData.content,
        mimeType: 'text/plain',
        notes: formData.notes,
      });

      onClose();
      setFormData({ filename: '', content: '', notes: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl rounded-[26px] border-white/12 bg-slate-950/90">
        <DialogHeader>
          <DialogTitle>{file ? 'Edit file' : 'Add new file'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 text-white">
          {!file && (
            <div className="space-y-2">
              <Label>Upload file</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed border-white/20 bg-white/5 p-8 transition hover:border-white/40 hover:bg-white/10"
              >
                <Upload className="h-10 w-10 text-white/60" />
                <div className="text-center">
                  <p className="text-sm font-medium text-white/80">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-white/60">
                    .env, .txt, .json, .yaml, or any text file
                  </p>
                </div>
                {formData.filename && (
                  <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{formData.filename}</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".env,.txt,.json,.yaml,.yml,.md,.xml,.csv,.config,.conf,.ini"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="filename">Filename *</Label>
            <Input
              id="filename"
              value={formData.filename}
              onChange={(e) => setFormData({ ...formData, filename: e.target.value })}
              placeholder="e.g., .env"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Paste or edit your file content here..."
              rows={12}
              className="font-mono text-xs"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this file..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-full border-white/25 bg-white/5 text-white/80 hover:text-white"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-full">
              {loading ? 'Saving...' : file ? 'Update file' : 'Add file'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
