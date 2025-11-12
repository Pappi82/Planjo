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
      <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-white/10 text-white/60">
        Select a document to edit or create a new one
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-4 border-b border-white/10 p-4">
        <Input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Document title..."
          className="border-none bg-transparent text-2xl font-semibold text-white shadow-none focus-visible:ring-0"
        />
        <Button onClick={handleSave} disabled={!hasChanges || saving} size="sm">
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

      <div className="flex-1 overflow-hidden" data-color-mode="light">
        <MDEditor value={content} onChange={handleContentChange} height="100%" preview="live" hideToolbar={false} />
      </div>

      {hasChanges && !saving && (
        <div className="border-t border-white/10 px-4 py-2 text-xs text-white/60">
          Unsaved changes • Auto-save in 10 seconds
        </div>
      )}
    </div>
  );
}
