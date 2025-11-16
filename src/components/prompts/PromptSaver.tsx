'use client';

import { useState } from 'react';
import { BookmarkPlus, Copy, Star, Trash2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { usePrompts } from '@/hooks/usePrompts';
import { Prompt } from '@/types';

interface PromptSaverProps {
  className?: string;
}

export default function PromptSaver({ className = '' }: PromptSaverProps) {
  const { prompts, mutate } = usePrompts();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', tags: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        setFormData({ title: '', content: '', tags: '' });
        setShowForm(false);
        mutate();
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopiedId(String(prompt._id));
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Error copying prompt:', error);
    }
  };

  const handleToggleFavorite = async (prompt: Prompt) => {
    try {
      await fetch(`/api/prompts/${String(prompt._id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !prompt.isFavorite }),
      });
      mutate();
    } catch (error) {
      console.error('Error updating prompt:', error);
    }
  };

  const handleDelete = async (promptId: string) => {
    try {
      await fetch(`/api/prompts/${promptId}`, {
        method: 'DELETE',
      });
      mutate();
    } catch (error) {
      console.error('Error deleting prompt:', error);
    }
  };

  const displayPrompts = prompts.slice(0, 3);

  return (
    <div className={`rounded-[24px] border border-white/12 bg-white/[0.05] p-6 text-white shadow-[0_16px_32px_rgba(15,23,42,0.35)] ${className}`}>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full border"
            style={{
              borderColor: '#6f9eff55',
              backgroundColor: '#6f9eff15',
              color: '#6f9eff',
            }}
          >
            <BookmarkPlus className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">Prompt Library</p>
            <p className="text-lg font-semibold">Saved Prompts</p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          className="h-8 gap-2 rounded-xl border border-white/20 bg-white/10 px-3 text-xs text-white hover:bg-white/20"
        >
          {showForm ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          {showForm ? 'Cancel' : 'Add Prompt'}
        </Button>
      </div>

      {/* Add Prompt Form */}
      {showForm && (
        <form onSubmit={handleSave} className="mb-5 space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div>
            <Input
              placeholder="Prompt title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
              disabled={isSaving}
            />
          </div>
          <div>
            <Textarea
              placeholder="Paste your prompt here..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="min-h-[100px] border-white/10 bg-white/5 text-white placeholder:text-white/40"
              disabled={isSaving}
            />
          </div>
          <div>
            <Input
              placeholder="Tags (comma-separated)..."
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
              disabled={isSaving}
            />
          </div>
          <Button
            type="submit"
            disabled={isSaving || !formData.title.trim() || !formData.content.trim()}
            className="w-full rounded-xl bg-[#6f9eff] text-white hover:bg-[#5a8eef]"
          >
            {isSaving ? 'Saving...' : 'Save Prompt'}
          </Button>
        </form>
      )}

      {/* Prompts List */}
      {displayPrompts.length > 0 ? (
        <div className="space-y-3">
          {displayPrompts.map((prompt) => (
            <div
              key={String(prompt._id)}
              className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="mb-1 font-medium text-white">{prompt.title}</h4>
                  <p className="line-clamp-2 text-sm text-white/60">{prompt.content}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleToggleFavorite(prompt)}
                    className="rounded-lg p-1.5 transition hover:bg-white/10"
                    title={prompt.isFavorite ? 'Unfavorite' : 'Favorite'}
                  >
                    <Star
                      className="h-4 w-4"
                      fill={prompt.isFavorite ? '#f9a826' : 'none'}
                      color={prompt.isFavorite ? '#f9a826' : '#ffffff88'}
                    />
                  </button>
                  <button
                    onClick={() => handleCopy(prompt)}
                    className="rounded-lg p-1.5 transition hover:bg-white/10"
                    title="Copy to clipboard"
                  >
                    <Copy
                      className="h-4 w-4"
                      color={copiedId === String(prompt._id) ? '#38f8c7' : '#ffffff88'}
                    />
                  </button>
                  <button
                    onClick={() => handleDelete(String(prompt._id))}
                    className="rounded-lg p-1.5 transition hover:bg-white/10"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-white/60 hover:text-[#ff5c87]" />
                  </button>
                </div>
              </div>
              {prompt.tags && prompt.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {prompt.tags.map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="border-white/20 bg-white/5 text-xs text-white/70"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
          {prompts.length > 3 && (
            <div className="pt-2 text-center">
              <p className="text-sm text-white/50">
                Showing {displayPrompts.length} of {prompts.length} prompts
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-8 text-center">
          <BookmarkPlus className="mx-auto mb-2 h-8 w-8 text-white/30" />
          <p className="text-sm text-white/50">No prompts saved yet</p>
          <p className="mt-1 text-xs text-white/40">Click "Add Prompt" to save your first one</p>
        </div>
      )}
    </div>
  );
}
