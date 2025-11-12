'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ICredential } from '@/types';
import { decrypt } from '@/lib/encryption';
import { Copy, Eye, EyeOff, Edit, Trash2, ExternalLink } from 'lucide-react';

interface CredentialCardProps {
  credential: ICredential;
  onEdit: (credential: ICredential) => void;
  onDelete: (id: string) => void;
}

export default function CredentialCard({ credential, onEdit, onDelete }: CredentialCardProps) {
  const [showValue, setShowValue] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const decryptedValue = decrypt(credential.encryptedValue);
    navigator.clipboard.writeText(decryptedValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayValue = showValue
    ? decrypt(credential.encryptedValue)
    : '••••••••••••';

  return (
    <Card className="border-white/10 bg-white/5 p-0">
      <CardHeader className="px-6 pt-6 pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            {credential.name}
            {(credential as any).url && (
              <a
                href={(credential as any).url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </CardTitle>
          <Badge variant="outline" className="text-xs uppercase tracking-[0.2em] text-white/70">
            {credential.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-6 pb-6">
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-2xl border border-white/10 bg-[#05060f]/60 px-3 py-2 text-sm text-white">
            {displayValue}
          </code>
          <Button size="icon" variant="ghost" onClick={() => setShowValue(!showValue)}>
            {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="ghost" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        {copied && <p className="text-xs text-[#38f8c7]">Copied to clipboard!</p>}

        {credential.notes && <p className="text-sm text-white/70">{credential.notes}</p>}

        <div className="flex gap-2">
          <Button size="icon-sm" variant="ghost" onClick={() => onEdit(credential)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={() => onDelete(credential._id.toString())}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
