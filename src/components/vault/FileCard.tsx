'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { IVaultFile } from '@/types';
import { Copy, Download, Edit, Trash2, FileText } from 'lucide-react';

interface FileCardProps {
  file: IVaultFile & { decryptedContent?: string };
  onEdit: (file: IVaultFile) => void;
  onDelete: (id: string) => void;
}

export default function FileCard({ file, onEdit, onDelete }: FileCardProps) {
  const [copied, setCopied] = useState(false);

  const decryptedContent = file.decryptedContent || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(decryptedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([decryptedContent], { type: file.mimeType || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="relative overflow-hidden rounded-[26px] border border-white/12 bg-white/[0.08] p-6 text-white shadow-[0_22px_44px_rgba(5,8,26,0.5)] transition hover:-translate-y-1 hover:border-white/35 hover:bg-white/[0.12]">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-16 right-14 h-40 w-40 rounded-full bg-[#38f8c7]/20 blur-[110px]" />
      </div>
      <div className="relative z-10 space-y-4">
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-white/15 bg-white/10 p-2">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{file.filename}</h3>
              <p className="text-xs text-white/60">{formatBytes(file.size)}</p>
            </div>
          </div>
        </header>

        <div className="rounded-[18px] border border-white/15 bg-slate-950/60 p-4">
          <pre className="max-h-48 overflow-auto text-xs text-white/80 whitespace-pre-wrap break-all">
            {decryptedContent.substring(0, 500)}
            {decryptedContent.length > 500 ? '...' : ''}
          </pre>
        </div>

        {copied ? <p className="text-xs text-[#38f8c7]">Copied to clipboard!</p> : null}

        {file.notes ? (
          <p className="text-sm text-white/70">{file.notes}</p>
        ) : null}

        <div className="flex gap-2">
          <Button
            size="icon-sm"
            variant="ghost"
            className="rounded-full border border-white/15 bg-white/10"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className="rounded-full border border-white/15 bg-white/10"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className="rounded-full border border-white/15 bg-white/10"
            onClick={() => onEdit(file)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className="rounded-full border border-white/15 bg-white/10 text-[#ff5c87] hover:text-[#ff5c87]"
            onClick={() => onDelete(file._id.toString())}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
