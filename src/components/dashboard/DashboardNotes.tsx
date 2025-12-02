'use client';

import { useState, useEffect } from 'react';
import { StickyNote, Plus, X, Loader2, Copy, Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Note } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface DashboardNotesProps {
  userId?: string;
}

export default function DashboardNotes({ userId }: DashboardNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch notes on mount
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('/api/notes');
        if (response.ok) {
          const data = await response.json();
          setNotes(data.notes || []);
        }
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNoteContent }),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes([data.note, ...notes]);
        setNewNoteContent('');
        setShowInput(false);
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteNote = async (noteId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotes(notes.filter((note) => note._id.toString() !== noteId));
        if (selectedNote && selectedNote._id.toString() === noteId) {
          setSelectedNote(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleOpenNote = (note: Note) => {
    setSelectedNote(note);
    setEditContent(note.content);
    setIsEditing(false);
    setCopied(false);
  };

  const handleCloseModal = () => {
    setSelectedNote(null);
    setIsEditing(false);
    setEditContent('');
    setCopied(false);
  };

  const handleEditNote = async () => {
    if (!selectedNote || !editContent.trim()) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/notes/${selectedNote._id.toString()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(notes.map((note) =>
          note._id.toString() === selectedNote._id.toString() ? data.note : note
        ));
        setSelectedNote(data.note);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyNote = async () => {
    if (!selectedNote) return;

    try {
      await navigator.clipboard.writeText(selectedNote.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy note:', error);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-white/12 bg-white/[0.04] p-6 text-white shadow-[0_18px_40px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:border-white/40 hover:bg-white/[0.08]">
      <div
        className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-90"
        style={{ background: `radial-gradient(circle at top, #8c6ff722 0%, transparent 60%)` }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#8c6ff7]/30 bg-[#8c6ff7]/10">
              <StickyNote className="h-6 w-6 text-[#8c6ff7]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Quick Notes</p>
              <h3 className="text-xl font-semibold">Notes</h3>
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{notes.length}</span>
            <span className="text-sm text-white/60">notes</span>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-4 flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-white/40" />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {showInput ? (
              <div className="space-y-2 rounded-xl border border-[#8c6ff7]/30 bg-[#8c6ff7]/5 p-3">
                <Textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Write your note..."
                  className="min-h-[80px] resize-none border-white/10 bg-white/5 text-sm text-white placeholder:text-white/40"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowInput(false);
                      setNewNoteContent('');
                    }}
                    disabled={isCreating}
                    className="h-8 text-xs text-white/70 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreateNote}
                    disabled={isCreating || !newNoteContent.trim()}
                    className="h-8 bg-[#8c6ff7] text-xs hover:bg-[#8c6ff7]/80"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Note'
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowInput(true)}
                className="w-full rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-4 text-center text-sm text-white/60 transition hover:border-[#8c6ff7]/40 hover:bg-[#8c6ff7]/5 hover:text-white/80"
              >
                <Plus className="mx-auto mb-1 h-5 w-5" />
                Add a note
              </button>
            )}

            {notes.length === 0 && !showInput ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
                <StickyNote className="mx-auto h-10 w-10 text-white/20" />
                <p className="mt-3 text-sm text-white/60">No notes yet</p>
                <p className="mt-1 text-xs text-white/40">Click above to create your first note</p>
              </div>
            ) : (
              <div className="max-h-[280px] space-y-2 overflow-y-auto">
                {notes.map((note) => (
                  <div
                    key={note._id.toString()}
                    onClick={() => handleOpenNote(note)}
                    className="group/note relative cursor-pointer rounded-xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-[#8c6ff7]/30 hover:bg-[#8c6ff7]/5"
                  >
                    <button
                      onClick={(e) => handleDeleteNote(note._id.toString(), e)}
                      className="absolute right-2 top-2 z-10 rounded-lg p-1 opacity-0 transition hover:bg-red-500/20 group-hover/note:opacity-100"
                      title="Delete note"
                    >
                      <X className="h-3.5 w-3.5 text-red-400" />
                    </button>
                    <p className="line-clamp-2 pr-8 text-sm text-white">{note.content}</p>
                    <p className="mt-2 text-xs text-white/50">
                      {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={!!selectedNote} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-2xl rounded-[24px] border-white/10 bg-slate-950/80 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Note</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {isEditing ? (
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[200px] resize-none border-white/10 bg-white/5 text-sm text-white placeholder:text-white/40"
                autoFocus
              />
            ) : (
              <div className="max-h-[400px] overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="whitespace-pre-wrap text-sm text-white">{selectedNote?.content}</p>
              </div>
            )}

            {selectedNote && (
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <p className="text-xs text-white/50">
                  Created {formatDistanceToNow(new Date(selectedNote.createdAt), { addSuffix: true })}
                </p>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          setEditContent(selectedNote.content);
                        }}
                        disabled={isSaving}
                        className="text-white/70 hover:text-white"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleEditNote}
                        disabled={isSaving || !editContent.trim()}
                        className="bg-[#8c6ff7] hover:bg-[#8c6ff7]/80"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyNote}
                        className="text-white/70 hover:text-white"
                      >
                        {copied ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="text-white/70 hover:text-white"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleDeleteNote(selectedNote._id.toString());
                        }}
                        className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
