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
    <div className="relative flex h-full flex-col rounded-[28px] border border-white/12 bg-white/[0.06] shadow-[0_26px_52px_rgba(5,8,26,0.5)]">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -top-24 right-16 h-44 w-44 rounded-full bg-[#6f9eff]/25 blur-[120px]" />
      </div>
      <div className="relative z-10 flex flex-col">
        <div className="space-y-5 border-b border-white/12 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white">
              <Calendar className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">Entry</p>
                <h2 className="text-2xl font-semibold">{formatDate(date)}</h2>
              </div>
            </div>
            <Button
              className="rounded-full px-5"
              onClick={handleSave}
              disabled={saving || !hasChanges}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : hasChanges ? 'Save entry' : 'Saved'}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-white/70">
            <Label className="text-xs uppercase tracking-[0.35em] text-white/50">
              Mood
            </Label>
            <Select
              value={mood}
              onValueChange={(value) => {
                setMood(value as any);
                setHasChanges(true);
              }}
            >
              <SelectTrigger className="w-56 rounded-full border-white/20 bg-white/5 text-white/80">
                <SelectValue placeholder="Mood" />
              </SelectTrigger>
              <SelectContent className="rounded-[20px] border border-white/10 bg-slate-950/90 text-white">
                {MOOD_OPTIONS_ARRAY.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-hidden" data-color-mode="dark">
          <MDEditor
            value={content}
            onChange={(val) => {
              setContent(val || '');
              setHasChanges(true);
            }}
            height="100%"
            preview="edit"
            className="planjo-journal-editor"
            textareaProps={{
              placeholder:
                'What did you work on today? Decisions made, blockers lifted, shifts in your energy?',
            }}
          />
        </div>

        <div className="border-t border-white/12 px-6 py-3 text-xs text-white/55">
          {saving
            ? 'Saving entry...'
            : hasChanges
              ? 'Unsaved changes • Autosaves after a few beats'
              : 'All thoughts synced'}
        </div>
      </div>
    </div>
  );
}
