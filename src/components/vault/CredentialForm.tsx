'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, X } from 'lucide-react';
import { ICredential } from '@/types';
import { CREDENTIAL_CATEGORIES_ARRAY } from '@/lib/constants';

interface CredentialFormProps {
  credential?: ICredential;
  projectId: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function CredentialForm({
  credential,
  projectId,
  open,
  onClose,
  onSubmit,
}: CredentialFormProps) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    category: credential?.category || 'files',
    label: credential?.label || '',
    value: '', // Decrypted value for editing (or file content)
    url: (credential as any)?.url || '',
    notes: credential?.notes || '',
    filename: credential?.filename || '',
    mimeType: credential?.mimeType || '',
  });

  // Reset form when dialog opens/closes or credential changes
  useEffect(() => {
    if (open) {
      if (credential) {
        // Editing existing credential
        setFormData({
          category: credential.category,
          label: credential.label,
          value: '', // Will be filled by user if they want to change it
          url: (credential as any)?.url || '',
          notes: credential.notes || '',
          filename: credential.filename || '',
          mimeType: credential.mimeType || '',
        });
      } else {
        // Creating new credential - reset to defaults
        setFormData({
          category: 'files',
          label: '',
          value: '',
          url: '',
          notes: '',
          filename: '',
          mimeType: '',
        });
      }
    }
  }, [open, credential]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      const text = await selectedFile.text();
      setFormData({
        ...formData,
        filename: selectedFile.name,
        value: text,
        mimeType: selectedFile.type || 'text/plain',
        label: formData.label || selectedFile.name, // Auto-fill label if empty
      });
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Failed to read file. Please try again.');
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    try {
      const text = await droppedFile.text();
      setFormData({
        ...formData,
        filename: droppedFile.name,
        value: text,
        mimeType: droppedFile.type || 'text/plain',
        label: formData.label || droppedFile.name,
      });
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Failed to read file. Please try again.');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClearFile = () => {
    setFormData({
      ...formData,
      filename: '',
      value: '',
      mimeType: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData: any = {
        projectId,
        category: formData.category,
        label: formData.label,
        notes: formData.notes,
      };

      // Add category-specific fields
      if (formData.category === 'files') {
        submitData.value = formData.value; // File content
        submitData.filename = formData.filename;
        submitData.mimeType = formData.mimeType;
        submitData.size = new Blob([formData.value]).size;
      } else {
        submitData.value = formData.value; // Secret value
        submitData.url = formData.url;
      }

      await onSubmit(submitData);

      // Reset form data
      setFormData({
        category: 'files',
        label: '',
        value: '',
        url: '',
        notes: '',
        filename: '',
        mimeType: '',
      });

      onClose();
    } catch (error) {
      console.error('Error submitting credential:', error);
      alert(error instanceof Error ? error.message : 'Failed to save credential. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFileCategory = formData.category === 'files';

  // Dynamic field labels based on category
  const getLabelFieldLabel = () => {
    switch (formData.category) {
      case 'files':
        return 'Label / Description *';
      case 'env-var':
        return 'Key *';
      case 'api-key':
        return 'Name / Service *';
      case 'password':
        return 'Service / Account *';
      case 'database-url':
        return 'Database Name *';
      case 'other':
        return 'Label *';
      default:
        return 'Label *';
    }
  };

  const getLabelFieldPlaceholder = () => {
    switch (formData.category) {
      case 'files':
        return 'e.g., Production .env file';
      case 'env-var':
        return 'e.g., DATABASE_URL';
      case 'api-key':
        return 'e.g., OpenAI API';
      case 'password':
        return 'e.g., GitHub Account';
      case 'database-url':
        return 'e.g., Production Database';
      case 'other':
        return 'e.g., SSH Key';
      default:
        return 'Enter a label';
    }
  };

  const getValueFieldLabel = () => {
    switch (formData.category) {
      case 'password':
        return 'Password *';
      case 'api-key':
        return 'API Key *';
      case 'database-url':
        return 'Connection String *';
      case 'env-var':
        return 'Value *';
      case 'other':
        return 'Secret Value *';
      default:
        return 'Value *';
    }
  };

  const getValueFieldPlaceholder = () => {
    switch (formData.category) {
      case 'password':
        return 'Enter password';
      case 'api-key':
        return 'sk-...';
      case 'database-url':
        return 'postgresql://user:pass@host:5432/db';
      case 'env-var':
        return 'Enter the value';
      case 'other':
        return 'Enter the secret value';
      default:
        return 'Enter value';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl rounded-[26px] border-white/12 bg-slate-950/90">
        <DialogHeader>
          <DialogTitle>
            {credential ? 'Edit credential' : 'Add new credential'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 text-white">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({
                ...formData,
                category: value as any,
                // Reset fields when switching categories
                value: '',
                filename: '',
                url: '',
              })}
            >
              <SelectTrigger className="rounded-full border-white/20 bg-white/5 text-white/80">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="rounded-[20px] border border-white/10 bg-slate-950/95 text-white">
                {CREDENTIAL_CATEGORIES_ARRAY.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Label Field - Dynamic based on category */}
          <div className="space-y-2">
            <Label htmlFor="label">{getLabelFieldLabel()}</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder={getLabelFieldPlaceholder()}
              required
            />
          </div>

          {/* Dynamic Content Based on Category */}
          {isFileCategory ? (
            <>
              {/* File Upload Section */}
              <div className="space-y-2">
                <Label>Upload file *</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!formData.filename ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
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
                      <p className="mt-2 text-xs text-[#38f8c7]/80">
                        💡 Can't see .env files? Press Cmd+Shift+. in the file picker
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-[20px] border border-white/20 bg-white/10 p-4">
                    <FileText className="h-8 w-8 text-[#38f8c7]" />
                    <div className="flex-1">
                      <p className="font-medium text-white">{formData.filename}</p>
                      <p className="text-xs text-white/60">
                        {new Blob([formData.value]).size} bytes
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

              {/* File Content Preview */}
              {formData.value && (
                <div className="space-y-2">
                  <Label>Content preview</Label>
                  <div className="rounded-[18px] border border-white/15 bg-slate-950/60 p-4">
                    <pre className="max-h-48 overflow-auto text-xs text-white/80 whitespace-pre-wrap break-all">
                      {formData.value.substring(0, 500)}
                      {formData.value.length > 500 ? '...' : ''}
                    </pre>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Value Field for Non-File Categories - Dynamic labels */}
              <div className="space-y-2">
                <Label htmlFor="value">
                  {getValueFieldLabel()} {credential ? '(leave empty to keep current)' : ''}
                </Label>
                <Input
                  id="value"
                  type={formData.category === 'password' ? 'password' : 'text'}
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={getValueFieldPlaceholder()}
                  required={!credential}
                />
              </div>

              {/* URL Field (not for files or env-vars) */}
              {formData.category !== 'env-var' && (
                <div className="space-y-2">
                  <Label htmlFor="url">Related URL (optional)</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              )}
            </>
          )}

          {/* Notes Field (for all categories) */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={isFileCategory ?
                'Additional context about this file...' :
                'Additional info, rotation cadence, etc.'
              }
              rows={3}
            />
          </div>

          {/* Action Buttons */}
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
              {loading ? 'Saving...' : credential ? 'Update' : 'Add credential'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
