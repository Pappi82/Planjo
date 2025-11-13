import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IDocument } from '@/types';
import { FileText, Search, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface DocumentListProps {
  documents: IDocument[];
  selectedId: string | null;
  onSelect: (document: IDocument) => void;
  onDelete: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function DocumentList({
  documents,
  selectedId,
  onSelect,
  onDelete,
  searchQuery,
  onSearchChange,
}: DocumentListProps) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.06] shadow-[0_24px_48px_rgba(5,8,26,0.45)]">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-16 left-12 h-36 w-36 rounded-full bg-[#6f9eff]/20 blur-[100px]" />
      </div>
      <div className="relative z-10 flex flex-col">
        <div className="space-y-3 border-b border-white/12 p-5">
          <h2 className="text-lg font-semibold text-white">Documents</h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="rounded-full border-white/15 bg-white/5 pl-10 text-sm text-white/80 placeholder:text-white/40"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-2 p-5">
            {documents.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/12 bg-white/[0.03] p-6 text-center text-white/60">
                {searchQuery ? 'No documents match this search.' : 'No documents yet.'}
              </div>
            ) : (
              documents.map((doc) => (
                <button
                  key={doc._id.toString()}
                  type="button"
                  className={`group flex w-full items-center gap-3 rounded-[20px] border px-4 py-3 text-left transition hover:-translate-y-[1px] hover:border-white/35 hover:bg-white/[0.08] ${
                    selectedId === doc._id.toString()
                      ? 'border-white/35 bg-white/[0.12]'
                      : 'border-white/12 bg-white/[0.04]'
                  }`}
                  onClick={() => onSelect(doc)}
                >
                  <span className="rounded-2xl border border-white/15 bg-white/10 p-2 text-white/70">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1 text-white">
                    <p className="truncate text-sm font-semibold">{doc.title}</p>
                    <p className="text-xs text-white/50">{formatDate(doc.updatedAt)}</p>
                  </div>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="rounded-full border border-white/10 bg-white/5 opacity-0 transition group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(doc._id.toString());
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
