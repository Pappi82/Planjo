'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Key, Lock, Database, FileCode, MoreHorizontal, Sparkles } from 'lucide-react';
import CredentialCard from '@/components/vault/CredentialCard';
import CredentialForm from '@/components/vault/CredentialForm';
import PasswordGenerator from '@/components/vault/PasswordGenerator';
import { ICredential, CredentialCategory } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const categories: CredentialCategory[] = ['api-key', 'password', 'database-url', 'env-var', 'other'];

export default function VaultPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { data, error, mutate } = useSWR(`/api/credentials?projectId=${projectId}`, fetcher);

  const [formOpen, setFormOpen] = useState(false);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<ICredential | undefined>();
  const [activeTab, setActiveTab] = useState<CredentialCategory>('api-key');

  const credentials: ICredential[] = data?.credentials || [];

  const handleCreate = async (credentialData: any) => {
    const res = await fetch('/api/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentialData),
    });

    if (res.ok) {
      mutate();
    }
  };

  const handleUpdate = async (credentialData: any) => {
    if (!editingCredential) return;

    const res = await fetch(`/api/credentials/${editingCredential._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentialData),
    });

    if (res.ok) {
      mutate();
      setEditingCredential(undefined);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this credential?')) return;

    const res = await fetch(`/api/credentials/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      mutate();
    }
  };

  const handleEdit = (credential: ICredential) => {
    setEditingCredential(credential);
    setFormOpen(true);
  };

  const handleUsePassword = () => {
    setGeneratorOpen(false);
  };

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertDescription>Failed to load credentials</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="planjo-panel flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">Secure vault</h1>
          <p className="text-white/60">Store API keys, passwords, and sensitive project credentials.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setGeneratorOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate password
          </Button>
          <Button
            onClick={() => {
              setEditingCredential(undefined);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add credential
          </Button>
        </div>
      </div>

      <Alert className="border-white/15 bg-white/5 text-white">
        <AlertDescription>
          Credentials encrypt locally before syncing. The encryption key never leaves your device.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CredentialCategory)} className="space-y-4">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="api-key" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API keys
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Passwords
          </TabsTrigger>
          <TabsTrigger value="database-url" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database URLs
          </TabsTrigger>
          <TabsTrigger value="env-var" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Env variables
          </TabsTrigger>
          <TabsTrigger value="other" className="flex items-center gap-2">
            <MoreHorizontal className="h-4 w-4" />
            Other
          </TabsTrigger>
        </TabsList>

        {categories.map((category) => {
          const categoryCredentials = credentials.filter((cred) => cred.category === category);
          return (
            <TabsContent key={category} value={category} className="space-y-4">
              {categoryCredentials.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-white/60">
                  No {category} credentials yet. Click &ldquo;Add credential&rdquo; to create one.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {categoryCredentials.map((credential) => (
                    <CredentialCard
                      key={credential._id.toString()}
                      credential={credential}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
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

      <PasswordGenerator open={generatorOpen} onClose={() => setGeneratorOpen(false)} onUse={handleUsePassword} />
    </div>
  );
}
