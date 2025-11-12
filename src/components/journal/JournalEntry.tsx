'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { IJournalEntry } from '@/types';
import { MOOD_OPTIONS_ARRAY } from '@/lib/constants';
import { Save, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface JournalEntryProps {
  date: Date;
  entry: IJournalEntry | null;
  onSave: (date: string, content: string, mood?: string) => Promise<void>;
}

export default function JournalEntry({ date, entry, onSave }: JournalEntryProps) {
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState(entry?.mood || 'good');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setContent(entry?.content || '');
    setMood(entry?.mood || 'good');
    setHasChanges(false);
  }, [entry, date]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(date.toISOString().split('T')[0], content, mood);
      setHasChanges(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="space-y-4 border-b border-white/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            <h2 className="text-2xl font-semibold">{formatDate(date)}</h2>
          </div>
          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : hasChanges ? 'Save entry' : 'Saved'}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-white/70">
          <Label>How are you feeling today?</Label>
          <Select
            value={mood}
            onValueChange={(value) => {
              setMood(value as any);
              setHasChanges(true);
            }}
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Mood" />
            </SelectTrigger>
            <SelectContent>
              {MOOD_OPTIONS_ARRAY.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-hidden" data-color-mode="light">
        <MDEditor
          value={content}
          onChange={(val) => {
            setContent(val || '');
            setHasChanges(true);
          }}
          height="100%"
          preview="edit"
          textareaProps={{
            placeholder:
              'What did you work on today? Any decisions made? Bugs fixed? Learnings?',
          }}
        />
      </div>

      {hasChanges && !saving && (
        <div className="border-t border-white/10 px-6 py-3 text-xs text-white/60">
          Unsaved changes • Auto-save in 10 seconds
        </div>
      )}
    </div>
  );
}
