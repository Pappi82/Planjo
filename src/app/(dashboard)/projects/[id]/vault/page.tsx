'use client';

import { ComponentType, useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Key, Lock, Database, FileCode, MoreHorizontal, Sparkles } from 'lucide-react';
import CredentialCard from '@/components/vault/CredentialCard';
import CredentialForm from '@/components/vault/CredentialForm';
import PasswordGenerator from '@/components/vault/PasswordGenerator';
import { ICredential, CredentialCategory } from '@/types';
import { PageHero } from '@/components/layout/PageHero';
import { SectionSurface } from '@/components/layout/SectionSurface';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

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
  const [pendingDelete, setPendingDelete] = useState<ICredential | null>(null);

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

  const handleDelete = async () => {
    if (!pendingDelete) return;

    const res = await fetch(`/api/credentials/${pendingDelete._id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setPendingDelete(null);
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
      <div className="p-8 text-white/70">
        Failed to load credentials. Refresh to try again.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <PageHero
        label="Vault"
        title="Secure vault"
        description="Store API keys, passwords, and sensitive credentials with encryption that never leaves your machine."
        highlight={
          <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.35em] text-white/60">
            {credentials.length} secrets
          </span>
        }
        actions={
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => setGeneratorOpen(true)}
              className="rounded-full border-white/25 bg-white/5 text-white/80 hover:text-white"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate password
            </Button>
            <Button
              className="rounded-full"
              onClick={() => {
                setEditingCredential(undefined);
                setFormOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add credential
            </Button>
          </div>
        }
      />

      <SectionSurface
        title="Encryption memo"
        description="Credentials encrypt locally before syncing. Your encryption key never leaves this device."
      >
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as CredentialCategory)}
          className="space-y-6"
        >
          <TabsList className="flex flex-wrap gap-2 rounded-full border border-white/15 bg-white/5 p-2">
            <VaultTrigger icon={Key} value="api-key" label="API keys" />
            <VaultTrigger icon={Lock} value="password" label="Passwords" />
            <VaultTrigger icon={Database} value="database-url" label="Database URLs" />
            <VaultTrigger icon={FileCode} value="env-var" label="Env variables" />
            <VaultTrigger icon={MoreHorizontal} value="other" label="Other" />
          </TabsList>

          {categories.map((category) => {
            const categoryCredentials = credentials.filter((cred) => cred.category === category);
            return (
              <TabsContent key={category} value={category} className="space-y-4">
                {categoryCredentials.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-white/12 bg-white/[0.03] p-10 text-center text-white/60">
                    No {category} credentials yet. Launch one to keep this vault humming.
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2">
                    {categoryCredentials.map((credential) => (
                      <CredentialCard
                        key={credential._id.toString()}
                        credential={credential}
                        onEdit={handleEdit}
                        onDelete={(id) => {
                          const target = credentials.find((cred) => cred._id.toString() === id);
                          if (target) setPendingDelete(target);
                        }}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </SectionSurface>

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

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete credential"
        description={
          pendingDelete
            ? `Delete "${pendingDelete.label}" from the vault? You’ll need to re-enter it if required later.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Keep credential"
        tone="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}

interface VaultTriggerProps {
  icon: ComponentType<{ className?: string }>;
  value: CredentialCategory;
  label: string;
}

function VaultTrigger({ icon: Icon, value, label }: VaultTriggerProps) {
  return (
    <TabsTrigger
      value={value}
      className="data-[state=active]:bg-white/15 data-[state=active]:text-white flex items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm text-white/70 transition data-[state=active]:border-white/30 data-[state=active]:shadow-[0_0_0_1px_rgba(255,255,255,0.15)]"
    >
      <Icon className="h-4 w-4" />
      {label}
    </TabsTrigger>
  );
}
