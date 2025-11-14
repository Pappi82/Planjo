'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [formData, setFormData] = useState({
    category: credential?.category || 'api-key',
    label: credential?.label || '',
    value: '', // Decrypted value for editing
    url: (credential as any)?.url || '',
    notes: credential?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send plain value to server - encryption happens server-side
      await onSubmit({
        projectId,
        category: formData.category,
        label: formData.label,
        value: formData.value, // Send plain value instead of encryptedValue
        url: formData.url,
        notes: formData.notes,
      });

      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-[26px] border-white/12 bg-slate-950/90">
        <DialogHeader>
          <DialogTitle>{credential ? 'Edit credential' : 'Add new credential'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 text-white">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as any })}
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
            <div className="space-y-2">
              <Label htmlFor="label">Label *</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g., OpenAI API Key"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Value * {credential ? '(leave empty to keep current)' : ''}</Label>
            <Input
              id="value"
              type="password"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="Enter the secret value"
              required={!credential}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="url">URL (optional)</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional info, rotation cadence, etc."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-full border-white/25 bg-white/5 text-white/80 hover:text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-full">
              {loading ? 'Saving...' : credential ? 'Update credential' : 'Add credential'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
