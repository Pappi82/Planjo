'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ICredential } from '@/types';
import { Copy, Eye, EyeOff, Edit, Trash2, ExternalLink, Download, FileText } from 'lucide-react';

interface CredentialCardProps {
  credential: ICredential;
  onEdit: (credential: ICredential) => void;
  onDelete: (id: string) => void;
}

export default function CredentialCard({ credential, onEdit, onDelete }: CredentialCardProps) {
  const [showValue, setShowValue] = useState(false);
  const [copied, setCopied] = useState(false);

  // The credential now includes decryptedValue from the server
  const decryptedValue = (credential as any).decryptedValue || '';
  const isFileCategory = credential.category === 'files';

  // Get dynamic field label for display
  const getFieldLabel = () => {
    switch (credential.category) {
      case 'env-var':
        return 'Value';
      case 'api-key':
        return 'API Key';
      case 'password':
        return 'Password';
      case 'database-url':
        return 'Connection String';
      case 'other':
        return 'Secret';
      default:
        return 'Value';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(decryptedValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!isFileCategory) return;
    const blob = new Blob([decryptedValue], { type: credential.mimeType || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = credential.filename || 'file.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const displayValue = showValue ? decryptedValue : '••••••••••••';

  return (
    <div className="relative overflow-hidden rounded-[26px] border border-white/12 bg-white/[0.08] p-6 text-white shadow-[0_22px_44px_rgba(5,8,26,0.5)] transition hover:-translate-y-1 hover:border-white/35 hover:bg-white/[0.12]">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-16 right-14 h-40 w-40 rounded-full bg-[#38f8c7]/20 blur-[110px]" />
      </div>
      <div className="relative z-10 space-y-4">
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {isFileCategory && credential.filename && (
              <div className="rounded-full border border-white/15 bg-white/10 p-2">
                <FileText className="h-4 w-4" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold">{credential.label}</h3>
              {isFileCategory && credential.filename && (
                <p className="text-xs text-white/60">
                  {credential.filename} • {formatBytes(credential.size)}
                </p>
              )}
            </div>
            {!isFileCategory && (credential as any).url ? (
              <a
                href={(credential as any).url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 transition hover:text-white"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </div>
          <Badge className="rounded-full border-white/20 bg-white/10 text-[0.65rem] uppercase tracking-[0.35em] text-white/70">
            {credential.category}
          </Badge>
        </header>

        {/* Content Display */}
        {isFileCategory ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-white/50">File Content</p>
            <div className="rounded-[18px] border border-white/15 bg-slate-950/60 p-4">
              <pre className="max-h-48 overflow-auto text-xs text-white/80 whitespace-pre-wrap break-all">
                {decryptedValue.substring(0, 500)}
                {decryptedValue.length > 500 ? '...' : ''}
              </pre>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-white/50">{getFieldLabel()}</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-[18px] border border-white/15 bg-slate-950/60 px-4 py-2 text-sm tracking-wide">
                {displayValue}
              </code>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full border border-white/15 bg-white/10"
                onClick={() => setShowValue(!showValue)}
              >
                {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full border border-white/15 bg-white/10"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {copied ? <p className="text-xs text-[#38f8c7]">Copied to clipboard!</p> : null}

        {credential.notes ? (
          <p className="text-sm text-white/70">{credential.notes}</p>
        ) : null}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isFileCategory && (
            <>
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
            </>
          )}
          <Button
            size="icon-sm"
            variant="ghost"
            className="rounded-full border border-white/15 bg-white/10"
            onClick={() => onEdit(credential)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className="rounded-full border border-white/15 bg-white/10 text-[#ff5c87] hover:text-[#ff5c87]"
            onClick={() => onDelete(credential._id.toString())}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
