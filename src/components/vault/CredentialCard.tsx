'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ICredential } from '@/types';
import { Copy, Eye, EyeOff, Edit, Trash2, ExternalLink } from 'lucide-react';

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

  const handleCopy = () => {
    navigator.clipboard.writeText(decryptedValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <h3 className="text-lg font-semibold">{credential.label}</h3>
            {(credential as any).url ? (
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

        {copied ? <p className="text-xs text-[#38f8c7]">Copied to clipboard!</p> : null}

        {credential.notes ? (
          <p className="text-sm text-white/70">{credential.notes}</p>
        ) : null}

        <div className="flex gap-2">
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
