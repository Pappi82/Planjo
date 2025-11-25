'use client';

import { useState } from 'react';
import { BookmarkPlus, Copy, Star, Trash2, Plus, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { usePrompts } from '@/hooks/usePrompts';
import { Prompt } from '@/types';

export default function PromptsPage() {
  const { prompts, mutate } = usePrompts();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', tags: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);

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
    if (!confirm('Are you sure you want to delete this prompt?')) return;
    
    try {
      await fetch(`/api/prompts/${promptId}`, {
        method: 'DELETE',
      });
      mutate();
    } catch (error) {
      console.error('Error deleting prompt:', error);
    }
  };

  // Filter prompts based on search and favorites
  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch = 
      searchQuery === '' ||
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFavorites = !filterFavorites || prompt.isFavorite;
    
    return matchesSearch && matchesFavorites;
  });

  return (
    <div className="relative flex min-h-full flex-col gap-8 pb-20">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-slate-950/70 p-8 shadow-[0_30px_80px_rgba(2,6,23,0.65)] backdrop-blur-3xl">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-[#6f9eff]/30 blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#ff5c87]/20 blur-[110px]" />
        </div>

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl border"
                style={{
                  borderColor: '#6f9eff55',
                  backgroundColor: '#6f9eff15',
                  color: '#6f9eff',
                }}
              >
                <BookmarkPlus className="h-6 w-6" />
              </span>
              <div>
                <p className="text-[0.75rem] uppercase tracking-[0.4em] text-white/60">Prompt Library</p>
                <h1 className="text-3xl font-semibold text-white md:text-4xl">Saved Prompts</h1>
              </div>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="h-12 rounded-full px-6 text-base shadow-[0_10px_30px_rgba(111,158,255,0.3)]"
            >
              {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              {showForm ? 'Cancel' : 'Add Prompt'}
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-white/20 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>
            <Button
              onClick={() => setFilterFavorites(!filterFavorites)}
              variant="outline"
              className={`rounded-full border-white/30 px-6 ${
                filterFavorites
                  ? 'bg-[#f9a826]/20 border-[#f9a826]/40 text-white'
                  : 'bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              <Star className={`mr-2 h-4 w-4 ${filterFavorites ? 'fill-[#f9a826] text-[#f9a826]' : ''}`} />
              {filterFavorites ? 'Favorites Only' : 'All Prompts'}
            </Button>
          </div>
        </div>
      </div>

      {/* Add Prompt Form */}
      {showForm && (
        <div className="relative overflow-hidden rounded-[28px] border border-white/12 bg-slate-950/70 p-6 shadow-[0_20px_40px_rgba(15,23,42,0.45)] backdrop-blur-3xl">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Input
                placeholder="Prompt title..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="border-white/20 bg-white/5 text-white placeholder:text-white/40"
                disabled={isSaving}
              />
            </div>
            <div>
              <Textarea
                placeholder="Paste your prompt here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="min-h-[150px] border-white/20 bg-white/5 text-white placeholder:text-white/40"
                disabled={isSaving}
              />
            </div>
            <div>
              <Input
                placeholder="Tags (comma-separated)..."
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="border-white/20 bg-white/5 text-white placeholder:text-white/40"
                disabled={isSaving}
              />
            </div>
            <Button
              type="submit"
              disabled={isSaving || !formData.title.trim() || !formData.content.trim()}
              className="w-full rounded-full bg-[#6f9eff] text-white hover:bg-[#5a8eef]"
            >
              {isSaving ? 'Saving...' : 'Save Prompt'}
            </Button>
          </form>
        </div>
      )}

      {/* Prompts Grid */}
      <div className="relative">
        {filteredPrompts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPrompts.map((prompt) => (
              <div
                key={String(prompt._id)}
                className="group relative overflow-hidden rounded-[24px] border border-white/12 bg-white/[0.04] p-6 text-white shadow-[0_20px_40px_rgba(15,23,42,0.45)] transition hover:border-white/25 hover:bg-white/[0.06]"
              >
                <div className="mb-4 flex items-start justify-between gap-2">
                  <h3 className="flex-1 text-lg font-semibold text-white">{prompt.title}</h3>
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

                <p className="mb-4 line-clamp-4 text-sm text-white/70">{prompt.content}</p>

                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
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
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[28px] border border-dashed border-white/20 bg-white/[0.03] p-12 text-center text-white shadow-[0_20px_40px_rgba(15,23,42,0.45)]">
            <BookmarkPlus className="mx-auto mb-4 h-12 w-12 text-white/30" />
            <h3 className="text-xl font-semibold">
              {searchQuery || filterFavorites ? 'No prompts found' : 'No prompts saved yet'}
            </h3>
            <p className="mt-2 text-sm text-white/60">
              {searchQuery || filterFavorites
                ? 'Try adjusting your search or filters'
                : 'Click "Add Prompt" to save your first prompt'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

