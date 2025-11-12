'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import DocumentEditor from '@/components/docs/DocumentEditor';
import DocumentList from '@/components/docs/DocumentList';
import { IDocument } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DocsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<IDocument | null>(null);

  const { data, error, mutate } = useSWR(
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    const res = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      if (selectedDocument?._id.toString() === id) {
        setSelectedDocument(null);
      }
      mutate();
    }
  };

  const handleSelect = (document: IDocument) => {
    setSelectedDocument(document);
  };

  return (
    <div className="space-y-6">
      <div className="planjo-panel flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Documentation</h1>
          <p className="text-white/60">Capture decisions, specs, and rituals per project.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New document
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <DocumentList
          documents={documents}
          selectedId={selectedDocument?._id.toString() || null}
          onSelect={handleSelect}
          onDelete={handleDelete}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <DocumentEditor document={selectedDocument} onSave={handleSave} />
      </div>
    </div>
  );
}
