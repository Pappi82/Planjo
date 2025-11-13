'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IDocument } from '@/types';
import { Save, Loader2 } from 'lucide-react';

// Dynamic import to avoid SSR issues with MDEditor
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface DocumentEditorProps {
  document: IDocument | null;
  onSave: (data: { title: string; content: string }) => Promise<void>;
}

export default function DocumentEditor({ document, onSave }: DocumentEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content || '');
      setHasChanges(false);
    }
  }, [document]);

  useEffect(() => {
    // Auto-save after 10 seconds of inactivity
    if (hasChanges && document) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }

      const timer = setTimeout(() => {
        handleSave();
      }, 10000);

      setAutoSaveTimer(timer);

      return () => clearTimeout(timer);
    }
  }, [hasChanges, title, content]);

  const handleSave = async () => {
    if (!document) return;

    setSaving(true);
    try {
      await onSave({ title, content });
      setHasChanges(false);
    } finally {
      setSaving(false);
    }
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setHasChanges(true);
  };

  const handleContentChange = (value?: string) => {
    setContent(value || '');
    setHasChanges(true);
  };

  if (!document) {
    return (
      <div className="flex h-full items-center justify-center rounded-[28px] border border-dashed border-white/12 bg-white/[0.03] text-white/60">
        Select a document to edit or create a new one
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.06] shadow-[0_26px_52px_rgba(5,8,26,0.5)]">
      <div className="pointer-events-none absolute inset-0 opacity-45">
        <div className="absolute -top-24 right-24 h-44 w-44 rounded-full bg-[#38f8c7]/20 blur-[120px]" />
      </div>
      <div className="relative z-10 flex flex-col">
        <div className="flex flex-wrap items-center gap-4 border-b border-white/12 p-5">
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Document title..."
            className="border-none bg-transparent text-2xl font-semibold text-white shadow-none focus-visible:ring-0"
          />
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            size="sm"
            className="rounded-full px-4"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-hidden" data-color-mode="dark">
          <MDEditor
            value={content}
            onChange={handleContentChange}
            height="100%"
            preview="live"
            hideToolbar={false}
            className="planjo-doc-editor"
          />
        </div>

        <div className="border-t border-white/12 px-5 py-3 text-xs text-white/55">
          {saving
            ? 'Saving changes...'
            : hasChanges
              ? 'Unsaved edits • Auto-saving in a moment'
              : 'All edits synced'}
        </div>
      </div>
    </div>
  );
}
