'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';
import DocumentEditor from '@/components/docs/DocumentEditor';
import DocumentList from '@/components/docs/DocumentList';
import DocumentUpload from '@/components/docs/DocumentUpload';
import DocumentCreate from '@/components/docs/DocumentCreate';
import { IDocument } from '@/types';
import { PageHero } from '@/components/layout/PageHero';
import { SectionSurface } from '@/components/layout/SectionSurface';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';
import { useProjects } from '@/hooks/useProjects';
import { ProjectStatus } from '@/lib/constants';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DocsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<IDocument | null>(null);
  const [pendingDelete, setPendingDelete] = useState<IDocument | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data, mutate } = useSWR(
    `/api/documents?projectId=${projectId}${searchQuery ? `&search=${searchQuery}` : ''}`,
    fetcher
  );
  const { projects, mutate: mutateProjects } = useProjects();

  const documents: IDocument[] = data?.documents || [];
  const project = projects?.find((p) => p._id.toString() === projectId);

  // Auto-select first document when list changes
  useEffect(() => {
    if (documents.length > 0 && !selectedDocument) {
      setSelectedDocument(documents[0]);
    }
  }, [documents]);

  const handleCreate = async (data: { title: string; content: string }) => {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        title: data.title,
        content: data.content,
      }),
    });

    if (res.ok) {
      const { document } = await res.json();
      mutate();
      setSelectedDocument(document);
      setCreateDialogOpen(false);
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

  const handleUpload = async (data: { title: string; content: string; filename: string }) => {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        title: data.title,
        content: data.content,
      }),
    });

    if (res.ok) {
      const { document } = await res.json();
      mutate();
      setSelectedDocument(document);
      setUploadDialogOpen(false);
    }
  };

  return (
    <div className="space-y-10">
      <PageHero
        label="Docs"
        title="Documentation"
        description="Capture decisions, specs, and rituals per project. Keep everything searchable and glowing."
        highlight={
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {project && (
              <ProjectStatusBadge
                projectId={projectId}
                currentStatus={project.status as ProjectStatus}
                onStatusChange={mutateProjects}
              />
            )}
            <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 uppercase tracking-[0.35em] text-white/60">
              {documents.length} docs
            </span>
          </div>
        }
        actions={
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setCreateDialogOpen(true)} className="rounded-full">
              <Plus className="mr-2 h-4 w-4" />
              New document
            </Button>
            <Button
              onClick={() => setUploadDialogOpen(true)}
              variant="outline"
              className="rounded-full border-white/25 bg-white/5 text-white/80 hover:text-white"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload file
            </Button>
          </div>
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

      <DocumentCreate
        projectId={projectId}
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={handleCreate}
      />

      <DocumentUpload
        projectId={projectId}
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUpload={handleUpload}
      />

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
