'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ICredential } from '@/types';
import { encrypt } from '@/lib/encryption';
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
      const encryptedValue = formData.value ? encrypt(formData.value) : credential?.encryptedValue;

      await onSubmit({
        projectId,
        category: formData.category,
        label: formData.label,
        encryptedValue,
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {credential ? 'Edit Credential' : 'Add New Credential'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
              placeholder="e.g., OpenAI API Key, Database Password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Value * {credential && '(leave empty to keep current)'}</Label>
            <Input
              id="value"
              type="password"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="Enter the secret value"
              required={!credential}
            />
          </div>

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
              placeholder="Additional information..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : credential ? 'Update' : 'Add'} Credential
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
