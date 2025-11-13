'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import DocumentEditor from '@/components/docs/DocumentEditor';
import DocumentList from '@/components/docs/DocumentList';
import { IDocument } from '@/types';
import { PageHero } from '@/components/layout/PageHero';
import { SectionSurface } from '@/components/layout/SectionSurface';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DocsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<IDocument | null>(null);
  const [pendingDelete, setPendingDelete] = useState<IDocument | null>(null);

  const { data, mutate } = useSWR(
    `/api/documents?projectId=${projectId}${searchQuery ? `&search=${searchQuery}` : ''}`,
    fetcher
  );

  const documents: IDocument[] = data?.documents || [];

  // Auto-select first document when list changes
  useEffect(() => {
    if (documents.length > 0 && !selectedDocument) {
      setSelectedDocument(documents[0]);
    }
  }, [documents]);

  const handleCreate = async () => {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        title: 'Untitled Document',
        content: '',
      }),
    });

    if (res.ok) {
      const { document } = await res.json();
      mutate();
      setSelectedDocument(document);
    }
  };

  const handleSave = async (data: { title: string; content: string }) => {
    if (!selectedDocument) return;

    const res = await fetch(`/api/documents/${selectedDocument._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      mutate();
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;

    const res = await fetch(`/api/documents/${pendingDelete._id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      if (selectedDocument?._id.toString() === pendingDelete._id.toString()) {
        setSelectedDocument(null);
      }
      setPendingDelete(null);
      mutate();
    }
  };

  const handleSelect = (document: IDocument) => {
    setSelectedDocument(document);
  };

  return (
    <div className="space-y-10">
      <PageHero
        label="Docs"
        title="Documentation"
        description="Capture decisions, specs, and rituals per project. Keep everything searchable and glowing."
        highlight={
          <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.35em] text-white/60">
            {documents.length} docs
          </span>
        }
        actions={
          <Button onClick={handleCreate} className="rounded-full">
            <Plus className="mr-2 h-4 w-4" />
            New document
          </Button>
        }
      />

      <SectionSurface>
        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <DocumentList
            documents={documents}
            selectedId={selectedDocument?._id.toString() || null}
            onSelect={handleSelect}
            onDelete={(id) => {
              const doc = documents.find((d) => d._id.toString() === id);
              if (doc) setPendingDelete(doc);
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <DocumentEditor document={selectedDocument} onSave={handleSave} />
        </div>
      </SectionSurface>

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete document"
        description={
          pendingDelete
            ? `Delete "${pendingDelete.title}"? This will remove it from the project permanently.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Keep document"
        tone="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}
