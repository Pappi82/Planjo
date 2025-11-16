'use client';

import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X } from 'lucide-react';

interface DocumentUploadProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
  onUpload: (data: { title: string; content: string; filename: string }) => Promise<void>;
}

export default function DocumentUpload({
  projectId,
  open,
  onClose,
  onUpload,
}: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    filename: '',
  });

  const handleFileSelect = async (file: File) => {
    try {
      const text = await file.text();
      setFormData({
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        content: text,
        filename: file.name,
      });
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Failed to read file. Please try again.');
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await handleFileSelect(selectedFile);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileSelect(file);
    }
  };

  const handleClearFile = () => {
    setFormData({
      title: '',
      content: '',
      filename: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content || !formData.title) return;

    setLoading(true);
    try {
      await onUpload(formData);
      handleClearFile();
      onClose();
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      handleClearFile();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl rounded-[28px] border border-white/15 bg-[#0a0b14]/95 p-8 text-white backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Upload Document</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-2">
            <Label>Select file *</Label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              className="hidden"
              accept=".md,.txt,.markdown,.text,.doc,.docx,.pdf"
            />

            {!formData.filename ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed p-12 transition ${
                  dragActive
                    ? 'border-[#38f8c7] bg-[#38f8c7]/10'
                    : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                }`}
              >
                <Upload className="h-12 w-12 text-white/60" />
                <div className="text-center">
                  <p className="text-base font-medium text-white/80">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-white/60">
                    Markdown, text, or document files
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-[20px] border border-white/20 bg-white/10 p-4">
                <FileText className="h-8 w-8 text-[#38f8c7]" />
                <div className="flex-1">
                  <p className="font-medium text-white">{formData.filename}</p>
                  <p className="text-xs text-white/60">
                    {new Blob([formData.content]).size} bytes
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={handleClearFile}
                  className="rounded-full border border-white/15 bg-white/10 text-white/70 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Title Field */}
          {formData.filename && (
            <div className="space-y-2">
              <Label htmlFor="title">Document title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter document title"
                required
                className="rounded-full border-white/20 bg-white/5 text-white/80"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.content || !formData.title || loading}
              className="rounded-full"
            >
              {loading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

