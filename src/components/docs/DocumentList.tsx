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
    <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="space-y-2 border-b border-white/10 p-4">
        <h2 className="text-lg font-semibold text-white">Documents</h2>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {documents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-white/60">
              {searchQuery ? 'No documents match this search.' : 'No documents yet.'}
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc._id.toString()}
                className={`group flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                  selectedId === doc._id.toString()
                    ? 'border-white/30 bg-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.4)]'
                    : 'border-white/10 bg-white/0 hover:border-white/20 hover:bg-white/5'
                }`}
                onClick={() => onSelect(doc)}
              >
                <FileText className="h-4 w-4 flex-shrink-0 text-white/70" />
                <div className="min-w-0 flex-1 text-white">
                  <p className="truncate text-sm font-semibold">{doc.title}</p>
                  <p className="text-xs text-white/50">{formatDate(doc.updatedAt)}</p>
                </div>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="opacity-0 transition group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(doc._id.toString());
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
