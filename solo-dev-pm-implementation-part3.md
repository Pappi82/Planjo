# Solo Dev Project Manager - Complete Implementation Guide (Part 3)
## Phases 7-12: Vault, Documentation, Journal, Vibe Mode, Momentum Tracker & Deployment

This is the final part of the implementation guide. Refer to Parts 1 and 2 for previous phases.

---

# PHASE 7: Secure Vault (Credentials Storage)

## Step 7.1: Create Credentials API Routes

Create `src/app/api/credentials/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Credential from '@/models/Credential';

// GET all credentials for a project
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const credentials = await Credential.find({
      projectId,
      userId: session.user.id,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ credentials });
  } catch (error) {
    console.error('Get credentials error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new credential
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, category, label, encryptedValue, url, notes } =
      await request.json();

    if (!projectId || !label || !encryptedValue || !category) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    await dbConnect();

    const credential = await Credential.create({
      userId: session.user.id,
      projectId,
      category,
      label,
      encryptedValue, // Already encrypted on client-side
      url,
      notes,
    });

    return NextResponse.json({ credential }, { status: 201 });
  } catch (error) {
    console.error('Create credential error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Create `src/app/api/credentials/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Credential from '@/models/Credential';

// PUT update credential
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    await dbConnect();

    const credential = await Credential.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!credential) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }

    return NextResponse.json({ credential });
  } catch (error) {
    console.error('Update credential error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE credential
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const credential = await Credential.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });

    if (!credential) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete credential error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Step 7.2: Create Vault Components

Create `src/components/vault/CredentialCard.tsx`:

```typescript
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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {credential.label}
              {credential.url && (
                <a
                  href={credential.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </CardTitle>
          </div>
          <Badge variant="secondary">{credential.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">
              {displayValue}
            </code>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowValue(!showValue)}
            >
              {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {copied && (
            <p className="text-xs text-green-600">Copied to clipboard!</p>
          )}

          {credential.notes && (
            <p className="text-sm text-muted-foreground">{credential.notes}</p>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(credential)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(credential._id.toString())}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

Create `src/components/vault/CredentialForm.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ICredential } from '@/types';
import { encrypt } from '@/lib/encryption';
import { CREDENTIAL_CATEGORIES } from '@/lib/constants';

interface CredentialFormProps {
  credential?: ICredential;
  projectId: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function CredentialForm({
  credential,
  projectId,
  open,
  onClose,
  onSubmit,
}: CredentialFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: credential?.category || 'api-key',
    label: credential?.label || '',
    value: '', // Decrypted value for editing
    url: credential?.url || '',
    notes: credential?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const encryptedValue = formData.value ? encrypt(formData.value) : credential?.encryptedValue;

      await onSubmit({
        projectId,
        category: formData.category,
        label: formData.label,
        encryptedValue,
        url: formData.url,
        notes: formData.notes,
      });

      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {credential ? 'Edit Credential' : 'Add New Credential'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CREDENTIAL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Label *</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="e.g., OpenAI API Key, Database Password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Value * {credential && '(leave empty to keep current)'}</Label>
            <Input
              id="value"
              type="password"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="Enter the secret value"
              required={!credential}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL (optional)</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional information..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : credential ? 'Update' : 'Add'} Credential
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

Create `src/components/vault/PasswordGenerator.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Key, Copy } from 'lucide-react';

interface PasswordGeneratorProps {
  onGenerate: (password: string) => void;
}

export default function PasswordGenerator({ onGenerate }: PasswordGeneratorProps) {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const generatePassword = () => {
    let charset = '';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charset) return;

    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setGeneratedPassword(password);
  };

  const handleUsePassword = () => {
    if (generatedPassword) {
      onGenerate(generatedPassword);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Key className="h-4 w-4 mr-2" />
          Generate Password
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-semibold">Password Generator</h4>

          <div className="space-y-2">
            <Label>Length: {length}</Label>
            <Input
              type="range"
              min="8"
              max="32"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="uppercase"
                checked={includeUppercase}
                onCheckedChange={(checked) => setIncludeUppercase(checked as boolean)}
              />
              <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowercase"
                checked={includeLowercase}
                onCheckedChange={(checked) => setIncludeLowercase(checked as boolean)}
              />
              <Label htmlFor="lowercase">Lowercase (a-z)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="numbers"
                checked={includeNumbers}
                onCheckedChange={(checked) => setIncludeNumbers(checked as boolean)}
              />
              <Label htmlFor="numbers">Numbers (0-9)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="symbols"
                checked={includeSymbols}
                onCheckedChange={(checked) => setIncludeSymbols(checked as boolean)}
              />
              <Label htmlFor="symbols">Symbols (!@#$...)</Label>
            </div>
          </div>

          <Button onClick={generatePassword} className="w-full">
            Generate
          </Button>

          {generatedPassword && (
            <div className="space-y-2">
              <code className="block bg-muted px-3 py-2 rounded text-sm font-mono break-all">
                {generatedPassword}
              </code>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleUsePassword}
                  className="flex-1"
                >
                  Use This Password
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(generatedPassword)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

## Step 7.3: Create Vault Page

Create `src/app/(dashboard)/projects/[id]/vault/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CredentialCard from '@/components/vault/CredentialCard';
import CredentialForm from '@/components/vault/CredentialForm';
import { Plus, Shield, AlertTriangle } from 'lucide-react';
import { ICredential } from '@/types';
import { CREDENTIAL_CATEGORIES } from '@/lib/constants';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function VaultPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { data, mutate } = useSWR(
    `/api/credentials?projectId=${projectId}`,
    fetcher
  );
  const credentials = data?.credentials || [];

  const [formOpen, setFormOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<ICredential | undefined>();

  const handleCreate = async (data: any) => {
    await fetch('/api/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    mutate();
  };

  const handleUpdate = async (data: any) => {
    if (!editingCredential) return;
    await fetch(`/api/credentials/${editingCredential._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    mutate();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this credential?')) return;
    await fetch(`/api/credentials/${id}`, { method: 'DELETE' });
    mutate();
  };

  const getCredentialsByCategory = (category: string) => {
    return credentials.filter((c: ICredential) => c.category === category);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Secure Vault</h1>
              <p className="text-muted-foreground">
                Store API keys, passwords, and secrets securely
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingCredential(undefined);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Credential
          </Button>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-600 dark:text-amber-400">
              Security Notice
            </p>
            <p className="text-muted-foreground">
              All credentials are encrypted before being stored. The decryption key is stored
              securely in environment variables and never leaves your server.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All ({credentials.length})
          </TabsTrigger>
          {CREDENTIAL_CATEGORIES.map((category) => {
            const count = getCredentialsByCategory(category.value).length;
            return (
              <TabsTrigger key={category.value} value={category.value}>
                {category.label} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {credentials.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No credentials yet. Add your first one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {credentials.map((credential: ICredential) => (
                <CredentialCard
                  key={credential._id.toString()}
                  credential={credential}
                  onEdit={(c) => {
                    setEditingCredential(c);
                    setFormOpen(true);
                  }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {CREDENTIAL_CATEGORIES.map((category) => (
          <TabsContent key={category.value} value={category.value} className="space-y-4 mt-6">
            {getCredentialsByCategory(category.value).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No {category.label.toLowerCase()} yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getCredentialsByCategory(category.value).map((credential: ICredential) => (
                  <CredentialCard
                    key={credential._id.toString()}
                    credential={credential}
                    onEdit={(c) => {
                      setEditingCredential(c);
                      setFormOpen(true);
                    }}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <CredentialForm
        credential={editingCredential}
        projectId={projectId}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingCredential(undefined);
        }}
        onSubmit={editingCredential ? handleUpdate : handleCreate}
      />
    </div>
  );
}
```

---

# PHASE 8: Documentation System

## Step 8.1: Create Documents API Routes

Create `src/app/api/documents/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Document from '@/models/Document';
import ActivityLog from '@/models/ActivityLog';

// GET all documents for a project
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const search = searchParams.get('search');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    let query: any = {
      projectId,
      userId: session.user.id,
    };

    // Full-text search if search query provided
    if (search) {
      query.$text = { $search: search };
    }

    const documents = await Document.find(query).sort({ updatedAt: -1 });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new document
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, title, content, category, tags } = await request.json();

    if (!projectId || !title) {
      return NextResponse.json(
        { error: 'Project ID and title are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const document = await Document.create({
      userId: session.user.id,
      projectId,
      title,
      content: content || '',
      category: category || 'General',
      tags: tags || [],
    });

    // Log activity
    await ActivityLog.create({
      userId: session.user.id,
      date: new Date(),
      actionType: 'doc_created',
      projectId,
      metadata: { docTitle: title },
      timestamp: new Date(),
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Create document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Create `src/app/api/documents/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Document from '@/models/Document';

// GET single document
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const document = await Document.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Get document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update document
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    await dbConnect();

    const document = await Document.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Update document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const document = await Document.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Step 8.2: Create Documentation Components

Create `src/components/docs/DocumentEditor.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IDocument } from '@/types';
import { Save } from 'lucide-react';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface DocumentEditorProps {
  document: IDocument | null;
  onSave: (data: Partial<IDocument>) => Promise<void>;
}

export default function DocumentEditor({ document, onSave }: DocumentEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content);
      setCategory(document.category);
      setHasChanges(false);
    }
  }, [document]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        title,
        content,
        category,
      });
      setHasChanges(false);
    } finally {
      setSaving(false);
    }
  };

  // Auto-save every 10 seconds if there are changes
  useEffect(() => {
    if (!hasChanges) return;

    const timeout = setTimeout(() => {
      handleSave();
    }, 10000);

    return () => clearTimeout(timeout);
  }, [hasChanges, title, content]);

  if (!document) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Select a document to edit</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Document title..."
            />
          </div>
          <div className="w-48 space-y-2">
            <Label>Category</Label>
            <Input
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Category..."
            />
          </div>
          <div className="pt-8">
            <Button onClick={handleSave} disabled={saving || !hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : hasChanges ? 'Save' : 'Saved'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <MDEditor
          value={content}
          onChange={(val) => {
            setContent(val || '');
            setHasChanges(true);
          }}
          height="100%"
          preview="edit"
        />
      </div>
    </div>
  );
}
```

Create `src/components/docs/DocumentList.tsx`:

```typescript
'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IDocument } from '@/types';
import { FileText, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface DocumentListProps {
  documents: IDocument[];
  selectedId: string | null;
  onSelect: (doc: IDocument) => void;
  onDelete: (id: string) => void;
}

export default function DocumentList({
  documents,
  selectedId,
  onSelect,
  onDelete,
}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="p-4 text-center">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No documents yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      {documents.map((doc) => (
        <Card
          key={doc._id.toString()}
          className={`cursor-pointer transition-colors ${
            selectedId === doc._id.toString()
              ? 'border-primary bg-accent'
              : 'hover:bg-accent'
          }`}
          onClick={() => onSelect(doc)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm truncate">{doc.title}</CardTitle>
                <CardDescription className="text-xs">
                  {doc.category} • {formatDate(doc.updatedAt)}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(doc._id.toString());
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
```

## Step 8.3: Create Documentation Page

Create `src/app/(dashboard)/projects/[id]/docs/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DocumentEditor from '@/components/docs/DocumentEditor';
import DocumentList from '@/components/docs/DocumentList';
import { Plus, Search } from 'lucide-react';
import { IDocument } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DocsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { data, mutate } = useSWR(`/api/documents?projectId=${projectId}`, fetcher);
  const documents = data?.documents || [];

  const [selectedDoc, setSelectedDoc] = useState<IDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreate = async () => {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        title: 'Untitled Document',
        content: '# Untitled Document\n\nStart writing...',
        category: 'General',
      }),
    });

    if (res.ok) {
      const { document } = await res.json();
      mutate();
      setSelectedDoc(document);
    }
  };

  const handleSave = async (data: Partial<IDocument>) => {
    if (!selectedDoc) return;

    await fetch(`/api/documents/${selectedDoc._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    mutate();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;

    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    
    if (selectedDoc?._id.toString() === id) {
      setSelectedDoc(null);
    }
    
    mutate();
  };

  const filteredDocs = searchQuery
    ? documents.filter((doc: IDocument) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : documents;

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b space-y-4">
          <Button onClick={handleCreate} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <DocumentList
            documents={filteredDocs}
            selectedId={selectedDoc?._id.toString() || null}
            onSelect={setSelectedDoc}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <DocumentEditor document={selectedDoc} onSave={handleSave} />
      </div>
    </div>
  );
}
```

---

# PHASE 9: Code Journal

## Step 9.1: Create Journal API Routes

Create `src/app/api/journal/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import JournalEntry from '@/models/JournalEntry';
import ActivityLog from '@/models/ActivityLog';

// GET journal entries
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    await dbConnect();

    let query: any = { userId: session.user.id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const entries = await JournalEntry.find(query)
      .populate('relatedProjectIds', 'title colorTheme')
      .sort({ date: -1 });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Get journal entries error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create journal entry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date, content, relatedProjectIds, relatedTaskIds, mood } =
      await request.json();

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if entry for this date already exists
    const existingEntry = await JournalEntry.findOne({
      userId: session.user.id,
      date: new Date(date),
    });

    let entry;
    if (existingEntry) {
      // Update existing entry
      entry = await JournalEntry.findByIdAndUpdate(
        existingEntry._id,
        {
          $set: {
            content,
            relatedProjectIds,
            relatedTaskIds,
            mood,
          },
        },
        { new: true }
      );
    } else {
      // Create new entry
      entry = await JournalEntry.create({
        userId: session.user.id,
        date: new Date(date),
        content,
        relatedProjectIds: relatedProjectIds || [],
        relatedTaskIds: relatedTaskIds || [],
        mood,
      });

      // Log activity
      await ActivityLog.create({
        userId: session.user.id,
        date: new Date(),
        actionType: 'journal_entry',
        metadata: { date },
        timestamp: new Date(),
      });
    }

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('Create journal entry error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Create `src/app/api/journal/[date]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import JournalEntry from '@/models/JournalEntry';

// GET journal entry for specific date
export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const entry = await JournalEntry.findOne({
      userId: session.user.id,
      date: new Date(params.date),
    }).populate('relatedProjectIds', 'title colorTheme');

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Get journal entry error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE journal entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const entry = await JournalEntry.findOneAndDelete({
      userId: session.user.id,
      date: new Date(params.date),
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete journal entry error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Step 9.2: Create Journal Components

Create `src/components/journal/JournalEntry.tsx`:

```typescript
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { IJournalEntry } from '@/types';
import { MOOD_OPTIONS } from '@/lib/constants';
import { Save, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface JournalEntryProps {
  date: Date;
  entry: IJournalEntry | null;
  onSave: (date: string, content: string, mood?: string) => Promise<void>;
}

export default function JournalEntry({ date, entry, onSave }: JournalEntryProps) {
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState(entry?.mood || 'good');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(date.toISOString().split('T')[0], content, mood);
      setHasChanges(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <h2 className="text-xl font-semibold">{formatDate(date)}</h2>
          </div>
          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : hasChanges ? 'Save Entry' : 'Saved'}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Label>How are you feeling today?</Label>
          <Select
            value={mood}
            onValueChange={(value) => {
              setMood(value as any);
              setHasChanges(true);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MOOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <MDEditor
          value={content}
          onChange={(val) => {
            setContent(val || '');
            setHasChanges(true);
          }}
          height="100%"
          preview="edit"
          textareaProps={{
            placeholder: 'What did you work on today? Any decisions made? Bugs fixed? Learnings?',
          }}
        />
      </div>
    </div>
  );
}
```

Create `src/components/journal/JournalTimeline.tsx`:

```typescript
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IJournalEntry } from '@/types';
import { Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { MOOD_OPTIONS } from '@/lib/constants';

interface JournalTimelineProps {
  entries: IJournalEntry[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function JournalTimeline({
  entries,
  selectedDate,
  onSelectDate,
}: JournalTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="p-4 text-center">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No journal entries yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      {entries.map((entry) => {
        const isSelected =
          new Date(entry.date).toDateString() === selectedDate.toDateString();
        const moodOption = MOOD_OPTIONS.find((m) => m.value === entry.mood);

        return (
          <Card
            key={entry._id.toString()}
            className={`cursor-pointer transition-colors ${
              isSelected ? 'border-primary bg-accent' : 'hover:bg-accent'
            }`}
            onClick={() => onSelectDate(new Date(entry.date))}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm">{formatDate(entry.date)}</CardTitle>
                  {entry.mood && (
                    <CardDescription className="text-xs mt-1">
                      {moodOption?.label}
                    </CardDescription>
                  )}
                </div>
                {entry.content && (
                  <Badge variant="secondary" className="text-xs">
                    {entry.content.split(/\s+/).length} words
                  </Badge>
                )}
              </div>
            </CardHeader>
            {entry.content && (
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {entry.content.substring(0, 100)}...
                </p>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
```

## Step 9.3: Create Journal Page

Create `src/app/(dashboard)/journal/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import JournalEntry from '@/components/journal/JournalEntry';
import JournalTimeline from '@/components/journal/JournalTimeline';
import { CalendarIcon, BookOpen } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const { data, mutate } = useSWR('/api/journal', fetcher);
  const entries = data?.entries || [];

  // Fetch specific entry for selected date
  const dateStr = selectedDate.toISOString().split('T')[0];
  const { data: entryData } = useSWR(`/api/journal/${dateStr}`, fetcher);
  const currentEntry = entryData?.entry;

  const handleSave = async (date: string, content: string, mood?: string) => {
    await fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, content, mood }),
    });
    mutate();
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Code Journal</h2>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDate(selectedDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button
            className="w-full"
            onClick={() => setSelectedDate(new Date())}
          >
            Today's Entry
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <JournalTimeline
            entries={entries}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <JournalEntry
          date={selectedDate}
          entry={currentEntry}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
```

---

# PHASE 10: Vibe Mode (Focus View)

## Step 10.1: Create Vibe Mode Components

Create `src/components/vibe/PomodoroTimer.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface PomodoroTimerProps {
  onComplete?: () => void;
}

export default function PomodoroTimer({ onComplete }: PomodoroTimerProps) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  const totalSeconds = mode === 'work' ? 25 * 60 : 5 * 60;
  const currentSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            if (mode === 'work') {
              setMode('break');
              setMinutes(5);
            } else {
              setMode('work');
              setMinutes(25);
            }
            onComplete?.();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, mode, onComplete]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'work') {
      setMinutes(25);
    } else {
      setMinutes(5);
    }
    setSeconds(0);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-6xl font-bold font-mono">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <p className="text-muted-foreground mt-2 capitalize">{mode} Time</p>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="flex gap-2 justify-center">
        <Button size="lg" onClick={toggleTimer}>
          {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        <Button size="lg" variant="outline" onClick={resetTimer}>
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
```

Create `src/components/vibe/VibeScratchpad.tsx`:

```typescript
'use client';

import { Textarea } from '@/components/ui/textarea';

interface VibeScratchpadProps {
  value: string;
  onChange: (value: string) => void;
}

export default function VibeScratchpad({ value, onChange }: VibeScratchpadProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground">Quick Notes</h3>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Jot down quick thoughts while you work..."
        className="min-h-[150px] bg-muted/50 border-none resize-none"
      />
    </div>
  );
}
```

Create `src/components/vibe/VibeContainer.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ITask } from '@/types';
import PomodoroTimer from './PomodoroTimer';
import VibeScratchpad from './VibeScratchpad';
import { X, CheckCircle2 } from 'lucide-react';

interface VibeContainerProps {
  task: ITask;
  onClose: () => void;
  onComplete: () => void;
}

export default function VibeContainer({ task, onClose, onComplete }: VibeContainerProps) {
  const [scratchpad, setScratchpad] = useState('');
  const [bgColor, setBgColor] = useState('#1E293B');

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onClose]);

  const backgrounds = [
    { name: 'Dark', color: '#1E293B' },
    { name: 'Purple', color: '#4C1D95' },
    { name: 'Blue', color: '#1E3A8A' },
    { name: 'Green', color: '#14532D' },
    { name: 'Gray', color: '#374151' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{ backgroundColor: bgColor }}
    >
      <div className="max-w-3xl w-full space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Badge variant="secondary">{task.priority}</Badge>
            <h1 className="text-4xl font-bold text-white">{task.title}</h1>
            {task.description && (
              <p className="text-lg text-white/70">{task.description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Timer */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8">
          <PomodoroTimer />
        </div>

        {/* Scratchpad */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
          <VibeScratchpad value={scratchpad} onChange={setScratchpad} />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {backgrounds.map((bg) => (
              <button
                key={bg.name}
                className="w-10 h-10 rounded-full border-2 border-white/20 hover:border-white/50 transition-colors"
                style={{ backgroundColor: bg.color }}
                onClick={() => setBgColor(bg.color)}
                title={bg.name}
              />
            ))}
          </div>

          <Button
            size="lg"
            onClick={onComplete}
            className="bg-white text-black hover:bg-white/90"
          >
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Mark Complete
          </Button>
        </div>

        {/* Keyboard hint */}
        <p className="text-center text-white/50 text-sm">
          Press ESC to exit Vibe Mode
        </p>
      </div>
    </div>
  );
}
```

## Step 10.2: Create Vibe Mode Page

Create `src/app/vibe/[taskId]/page.tsx`:

```typescript
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTask } from '@/hooks/useTasks';
import VibeContainer from '@/components/vibe/VibeContainer';
import { Loader2 } from 'lucide-react';

export default function VibeModePage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;

  const { task, isLoading, mutate } = useTask(taskId);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!task) {
    router.push('/');
    return null;
  }

  const handleComplete = async () => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completedAt: new Date() }),
    });
    mutate();
    router.back();
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <VibeContainer
      task={task}
      onClose={handleClose}
      onComplete={handleComplete}
    />
  );
}
```

---

# PHASE 11: Momentum Tracker (Analytics)

## Step 11.1: Create Activity Tracker

Create `src/lib/activity-tracker.ts`:

```typescript
import dbConnect from './db';
import ActivityLog from '@/models/ActivityLog';

export async function logActivity(
  userId: string,
  actionType: 'task_created' | 'task_completed' | 'task_moved' | 'journal_entry' | 'doc_created' | 'project_created',
  metadata: {
    projectId?: string;
    taskId?: string;
    [key: string]: any;
  }
) {
  try {
    await dbConnect();

    await ActivityLog.create({
      userId,
      date: new Date(),
      actionType,
      projectId: metadata.projectId,
      taskId: metadata.taskId,
      metadata,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}
```

## Step 11.2: Create Analytics API Routes

Create `src/app/api/analytics/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ActivityLog from '@/models/ActivityLog';
import Task from '@/models/Task';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    await dbConnect();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all activity logs for the period
    const activities = await ActivityLog.find({
      userId: session.user.id,
      timestamp: { $gte: startDate },
    }).sort({ timestamp: 1 });

    // Calculate streak
    const uniqueDates = new Set(
      activities.map((a) => a.date.toISOString().split('T')[0])
    );
    const sortedDates = Array.from(uniqueDates).sort().reverse();
    
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    
    const today = new Date().toISOString().split('T')[0];
    let checkDate = new Date(today);

    // Calculate current streak
    for (let i = 0; i < sortedDates.length; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (sortedDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate max streak
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const dayDiff = Math.floor(
          (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          maxStreak = Math.max(maxStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak);

    // Get completed tasks
    const completedTasks = await Task.find({
      userId: session.user.id,
      completedAt: { $gte: startDate },
    });

    // Calculate velocity (tasks per week)
    const weeklyVelocity: { [key: string]: number } = {};
    completedTasks.forEach((task) => {
      const week = getWeekNumber(new Date(task.completedAt!));
      weeklyVelocity[week] = (weeklyVelocity[week] || 0) + 1;
    });

    // Calculate productivity by hour
    const hourlyActivity: { [hour: number]: number } = {};
    activities.forEach((activity) => {
      const hour = new Date(activity.timestamp).getHours();
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    });

    // Get most productive hour
    let mostProductiveHour = 0;
    let maxActivity = 0;
    Object.entries(hourlyActivity).forEach(([hour, count]) => {
      if (count > maxActivity) {
        maxActivity = count;
        mostProductiveHour = parseInt(hour);
      }
    });

    return NextResponse.json({
      streak: {
        current: currentStreak,
        max: maxStreak,
      },
      tasksCompleted: completedTasks.length,
      weeklyVelocity,
      mostProductiveHour,
      hourlyActivity,
      activeDays: uniqueDates.size,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getWeekNumber(date: Date): string {
  const onejan = new Date(date.getFullYear(), 0, 1);
  const week = Math.ceil(((date.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${week}`;
}
```

## Step 11.3: Create Analytics Components

Create `src/components/analytics/StreakDisplay.tsx`:

```typescript
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Flame, Trophy } from 'lucide-react';

interface StreakDisplayProps {
  current: number;
  max: number;
}

export default function StreakDisplay({ current, max }: StreakDisplayProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{current}</div>
          <p className="text-xs text-muted-foreground">consecutive days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
          <Trophy className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{max}</div>
          <p className="text-xs text-muted-foreground">personal record</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

Create `src/components/analytics/VelocityChart.tsx`:

```typescript
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VelocityChartProps {
  data: { [key: string]: number };
}

export default function VelocityChart({ data }: VelocityChartProps) {
  const chartData = Object.entries(data).map(([week, count]) => ({
    week,
    tasks: count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Completion Velocity</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="tasks" stroke="#8B5CF6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

Create `src/components/analytics/ProductivityHeatmap.tsx`:

```typescript
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ProductivityHeatmapProps {
  hourlyActivity: { [hour: number]: number };
}

export default function ProductivityHeatmap({ hourlyActivity }: ProductivityHeatmapProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const maxActivity = Math.max(...Object.values(hourlyActivity));

  const getColor = (count: number) => {
    if (count === 0) return 'bg-muted';
    const intensity = count / maxActivity;
    if (intensity > 0.75) return 'bg-purple-600';
    if (intensity > 0.5) return 'bg-purple-500';
    if (intensity > 0.25) return 'bg-purple-400';
    return 'bg-purple-300';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Productive Hours</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 gap-2">
          {hours.map((hour) => {
            const count = hourlyActivity[hour] || 0;
            return (
              <div key={hour} className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded ${getColor(count)} flex items-center justify-center text-xs font-semibold`}
                  title={`${hour}:00 - ${count} activities`}
                >
                  {count > 0 ? count : ''}
                </div>
                <span className="text-xs text-muted-foreground">{hour}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Step 11.4: Create Analytics Page

Create `src/app/(dashboard)/analytics/page.tsx`:

```typescript
'use client';

import useSWR from 'swr';
import StreakDisplay from '@/components/analytics/StreakDisplay';
import VelocityChart from '@/components/analytics/VelocityChart';
import ProductivityHeatmap from '@/components/analytics/ProductivityHeatmap';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, Target, Clock } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AnalyticsPage() {
  const { data, isLoading } = useSWR('/api/analytics?days=30', fetcher);

  if (isLoading) {
    return <div className="p-8">Loading analytics...</div>;
  }

  const analytics = data || {};

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Momentum Tracker</h1>
        <p className="text-muted-foreground">Track your productivity and stay motivated</p>
      </div>

      <StreakDisplay current={analytics.streak?.current || 0} max={analytics.streak?.max || 0} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.tasksCompleted || 0}</div>
            <p className="text-xs text-muted-foreground">last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Days</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeDays || 0}</div>
            <p className="text-xs text-muted-foreground">days with activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.mostProductiveHour || 0}:00
            </div>
            <p className="text-xs text-muted-foreground">most productive time</p>
          </CardContent>
        </Card>
      </div>

      <VelocityChart data={analytics.weeklyVelocity || {}} />

      <ProductivityHeatmap hourlyActivity={analytics.hourlyActivity || {}} />
    </div>
  );
}
```

---

# PHASE 12: Polish & Deployment

## Step 12.1: Create Main Layout and Navigation

Create `src/components/layout/Sidebar.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Home,
  FolderKanban,
  Lightbulb,
  BookOpen,
  TrendingUp,
  Settings,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Parking Lot', href: '/parking-lot', icon: Lightbulb },
  { name: 'Journal', href: '/journal', icon: BookOpen },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r bg-muted/40 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Solo Dev PM</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-secondary'
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
```

Create `src/components/layout/TopBar.tsx`:

```typescript
'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/lib/utils';
import { LogOut } from 'lucide-react';

export default function TopBar() {
  const { data: session } = useSession();

  return (
    <div className="border-b bg-background">
      <div className="flex h-16 items-center px-8 justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarFallback>
                  {getInitials(session?.user?.name || 'User')}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
```

Create `src/app/(dashboard)/layout.tsx`:

```typescript
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
```

## Step 12.2: Create Dashboard Page

Create `src/app/(dashboard)/page.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { useProjects } from '@/hooks/useProjects';
import useSWR from 'swr';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProjectCard from '@/components/projects/ProjectCard';
import { Plus, TrendingUp, Target, Flame } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
  const { projects } = useProjects();
  const { data: analytics } = useSWR('/api/analytics?days=7', fetcher);

  const activeProjects = projects.filter((p) => p.status === 'active');

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your overview.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.streak?.current || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.tasksCompleted || 0}
            </div>
          </CardContent>
        </Card>

        <Link href="/projects">
          <Card className="cursor-pointer hover:bg-accent transition-colors h-full">
            <CardContent className="flex items-center justify-center h-full">
              <Button variant="ghost" size="lg">
                <Plus className="h-6 w-6 mr-2" />
                New Project
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Active Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Active Projects</h2>
          <Link href="/projects">
            <Button variant="outline">View All</Button>
          </Link>
        </div>

        {activeProjects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                No active projects. Create one to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeProjects.slice(0, 3).map((project) => (
              <ProjectCard key={project._id.toString()} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

## Step 12.3: Update Root Layout

Update `src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Solo Dev PM - Project Management for Solo Developers',
  description: 'A streamlined project management tool built for solo developers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

Create `src/app/providers.tsx`:

```typescript
'use client';

import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

## Step 12.4: Deployment Preparation

Create `README.md`:

```markdown
# Solo Dev Project Manager

A comprehensive project management application designed specifically for solo developers.

## Features

- ✅ Project Management
- ✅ Kanban Board & List View
- ✅ Parking Lot for Ideas
- ✅ Secure Credentials Vault
- ✅ Documentation System
- ✅ Code Journal
- ✅ Vibe Mode (Focus View)
- ✅ Momentum Tracker (Analytics)

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- MongoDB + Mongoose
- NextAuth.js
- Tailwind CSS + shadcn/ui
- Zustand
- @dnd-kit (Drag & Drop)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in values
4. Run development server: `npm run dev`

### Environment Variables

See `.env.example` for required environment variables.

## Deployment

This app is designed to be deployed on Vercel.

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

## License

MIT
```

Create `.gitignore`:

```
# Dependencies
node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
```

Create `vercel.json`:

```json
{
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

---

## Final Steps

1. **Test the application thoroughly**
   - Test all CRUD operations
   - Test authentication flow
   - Test drag & drop functionality
   - Test encryption/decryption in vault
   - Test Vibe Mode
   - Verify analytics calculations

2. **Set up MongoDB Atlas**
   - Create a cluster
   - Add database user
   - Whitelist IP addresses
   - Get connection string

3. **Deploy to Vercel**
   - Connect GitHub repository
   - Add environment variables
   - Deploy

4. **Post-deployment**
   - Test production build
   - Monitor errors with Vercel
   - Set up domain (optional)

---

## SUCCESS! 🎉

You now have a complete, production-ready solo developer project management application with all features including Vibe Mode and Momentum Tracker!

The application includes:
- Full project and task management
- Kanban boards with drag & drop
- Idea capture (Parking Lot)
- Encrypted credentials storage
- Documentation system with markdown
- Daily code journal
- **Vibe Mode for focused deep work**
- **Momentum Tracker with analytics**
- Beautiful, responsive UI
- Type-safe TypeScript throughout
- Optimized for AI code generation

Deploy and start managing your projects like a pro! 🚀
