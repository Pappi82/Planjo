'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle2, Circle, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MCP {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
  code?: string;
  icon?: string;
  isCustom?: boolean;
}

// Popular MCPs based on research
const MCPS_DATA: MCP[] = [
  // File System & Data Access
  {
    id: 'filesystem',
    name: 'Filesystem',
    category: 'File System',
    description: 'Secure file operations with configurable access controls. Read, write, and manage files and directories with permission-based restrictions.',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
  },
  {
    id: 'sqlite',
    name: 'SQLite',
    category: 'Database',
    description: 'Database interaction and business intelligence features. Query, analyze, and manage SQLite databases with schema inspection capabilities.',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite',
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    category: 'Database',
    description: 'Read-only database access with schema inspection capabilities. Connect to PostgreSQL databases and execute safe queries.',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres',
  },

  // Version Control
  {
    id: 'github',
    name: 'GitHub',
    category: 'Version Control',
    description: 'Official GitHub server for integration with repository management, PRs, issues, and more. Complete GitHub workflow automation.',
    url: 'https://github.com/github/github-mcp-server',
  },
  {
    id: 'git',
    name: 'Git',
    category: 'Version Control',
    description: 'Direct Git repository operations including reading, searching, and analyzing local repositories. Full version control capabilities.',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/git',
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    category: 'Version Control',
    description: 'GitLab platform integration for project management and CI/CD operations. Manage merge requests, issues, and pipelines.',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/gitlab',
  },

  // Cloud & Infrastructure
  {
    id: 'google-drive',
    name: 'Google Drive',
    category: 'Cloud Storage',
    description: 'File access and search capabilities for Google Drive. Read, write, and manage files in your Google Drive storage.',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive',
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    description: 'Channel management and messaging capabilities for Slack workspaces. Send messages, manage channels, and automate workflows.',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/slack',
  },
  {
    id: 'aws-kb-retrieval',
    name: 'AWS KB Retrieval',
    category: 'Cloud Services',
    description: 'Retrieval from AWS Knowledge Base. Access and query your AWS knowledge bases for intelligent information retrieval.',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/aws-kb-retrieval',
  },

  // Web & Search
  {
    id: 'brave-search',
    name: 'Brave Search',
    category: 'Search',
    description: 'Web search capabilities using Brave\'s Search API. Privacy-focused web, image, news, and video search.',
    url: 'https://github.com/brave/brave-search-mcp-server',
  },
  {
    id: 'fetch',
    name: 'Fetch',
    category: 'Web',
    description: 'Efficient web content fetching and processing for AI consumption. Extract and process web content intelligently.',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/fetch',
  },
  {
    id: 'puppeteer',
    name: 'Puppeteer',
    category: 'Web Automation',
    description: 'Browser automation and web scraping capabilities. Control headless Chrome for testing and data extraction.',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer',
  },

  // AI & ML
  {
    id: 'exa',
    name: 'Exa',
    category: 'AI Search',
    description: 'AI-powered search API for web searches. Get real-time web information with semantic search capabilities.',
    url: 'https://github.com/exa-labs/exa-mcp-server',
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    category: 'AI Search',
    description: 'Interacting with Perplexity API for advanced AI-powered search and research capabilities.',
    url: 'https://github.com/tanigami/mcp-server-perplexity',
  },

  // Development Tools
  {
    id: 'memory',
    name: 'Memory',
    category: 'Development',
    description: 'Knowledge graph-based persistent memory system. Store and retrieve contextual information across sessions.',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/memory',
  },
  {
    id: 'sequential-thinking',
    name: 'Sequential Thinking',
    category: 'Development',
    description: 'Dynamic and reflective problem-solving through thoughts. Enable step-by-step reasoning and analysis.',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking',
  },

  // Productivity & Workspace
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    category: 'Productivity',
    description: 'Interface with Google Calendar API. Manage events, schedules, and calendar operations through AI.',
    url: 'https://github.com/takumi0706/google-calendar-mcp',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'Productivity',
    description: 'Integration with Gmail and Google Calendar. Read, send, and manage emails through AI assistants.',
    url: 'https://github.com/MarkusPfundstein/mcp-gsuite',
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'Productivity',
    description: 'Integrates with Notion\'s API to manage personal todo lists and databases efficiently.',
    url: 'https://github.com/Badhansen/notion-mcp',
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    category: 'Productivity',
    description: 'Read and search any directory containing Markdown notes. Perfect for Obsidian vaults and knowledge bases.',
    url: 'https://github.com/calclavia/mcp-obsidian',
  },

  // Testing & Automation
  {
    id: 'playwright',
    name: 'Playwright',
    category: 'Testing',
    description: 'Browser automation for testing and web scraping. Control browsers programmatically for E2E testing.',
    url: 'https://github.com/microsoft/playwright-mcp',
  },

  // Security & Analysis
  {
    id: 'semgrep',
    name: 'Semgrep',
    category: 'Security',
    description: 'Allow AI agents to scan code for security vulnerabilities using Semgrep static analysis.',
    url: 'https://github.com/semgrep/mcp',
  },

  // Data & Analytics
  {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'Database',
    description: 'MongoDB database integration for document-based data operations and queries.',
    url: 'https://github.com/mongodb/mongodb-mcp-server',
  },

  // Communication
  {
    id: 'discord',
    name: 'Discord',
    category: 'Communication',
    description: 'Discord bot integration for server management and messaging automation.',
    url: 'https://github.com/discord/discord-mcp-server',
  },

  // Content & Media
  {
    id: 'youtube',
    name: 'YouTube',
    category: 'Media',
    description: 'Fetch YouTube subtitles and video information for content analysis and processing.',
    url: 'https://github.com/anaisbetts/mcp-youtube',
  },

  // Knowledge & Research
  {
    id: 'arxiv',
    name: 'ArXiv',
    category: 'Research',
    description: 'Search ArXiv research papers and access academic publications for research assistance.',
    url: 'https://github.com/blazickjp/arxiv-mcp-server',
  },
  {
    id: 'pubmed',
    name: 'PubMed',
    category: 'Research',
    description: 'MCP to search and read medical/life sciences papers from PubMed database.',
    url: 'https://github.com/andybrandt/mcp-simple-pubmed',
  },

  // Monitoring & Observability
  {
    id: 'sentry',
    name: 'Sentry',
    category: 'Monitoring',
    description: 'Sentry.io integration for error tracking and performance monitoring in applications.',
    url: 'https://github.com/getsentry/sentry-mcp',
  },
];

interface MCPCardProps {
  mcp: MCP;
  isSelected: boolean;
  onToggle: () => void;
  onClick: () => void;
}

function MCPCard({ mcp, isSelected, onToggle, onClick }: MCPCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group relative cursor-pointer overflow-hidden rounded-xl border p-4 transition-all duration-200 ${
        isSelected
          ? 'border-[#38f8c7]/50 bg-gradient-to-br from-[#38f8c7]/15 to-[#38f8c7]/5 shadow-[0_8px_24px_rgba(56,248,199,0.2)]'
          : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]'
      }`}
    >
      {isSelected && (
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#38f8c7]/30 blur-[50px]" />
        </div>
      )}

      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-white truncate">{mcp.name}</h3>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`flex-shrink-0 transition-all duration-200 ${
            isSelected
              ? 'text-[#38f8c7] scale-110'
              : 'text-white/30 hover:text-white/60 hover:scale-110'
          }`}
        >
          {isSelected ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}

interface MCPModalProps {
  mcp: MCP;
  onClose: () => void;
  onDelete?: () => void;
}

function MCPModal({ mcp, onClose, onDelete }: MCPModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative m-4 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-[#05081a]/95 p-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#8c6ff7]/30 blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[#38f8c7]/20 blur-[100px]" />
        </div>

        <div className="relative z-10">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white">{mcp.name}</h2>
              <p className="mt-2 text-sm uppercase tracking-wider text-white/50">
                {mcp.category}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full border border-white/20 bg-white/5 p-2 text-white/60 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="mb-6 text-white/80">{mcp.description}</p>

          {mcp.code && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-white/70">
                Installation Code
              </h3>
              <pre className="overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-4 text-sm text-white/90">
                {mcp.code}
              </pre>
            </div>
          )}

          <div className="flex items-center gap-3">
            <a
              href={mcp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#8c6ff7]/40 bg-[#8c6ff7]/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#8c6ff7]/60 hover:bg-[#8c6ff7]/20"
            >
              View on GitHub
              <ExternalLink className="h-4 w-4" />
            </a>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="rounded-full border border-white/10 bg-white/5 text-[#ff5c87] hover:bg-[#ff5c87]/10 hover:text-[#ff5c87]"
              >
                Delete MCP
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MCPsPage() {
  const [selectedMCPs, setSelectedMCPs] = useState<Set<string>>(new Set());
  const [selectedMCP, setSelectedMCP] = useState<MCP | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customMCPs, setCustomMCPs] = useState<MCP[]>([]);
  const [addMCPDialogOpen, setAddMCPDialogOpen] = useState(false);
  const [newMCP, setNewMCP] = useState({
    name: '',
    category: 'Custom',
    description: '',
    url: '',
    code: '',
  });

  useEffect(() => {
    // Load selected MCPs from localStorage
    const saved = localStorage.getItem('planjo-selected-mcps');
    if (saved) {
      setSelectedMCPs(new Set(JSON.parse(saved)));
    }

    // Load custom MCPs from localStorage
    const savedCustomMCPs = localStorage.getItem('planjo-custom-mcps');
    if (savedCustomMCPs) {
      setCustomMCPs(JSON.parse(savedCustomMCPs));
    }

    setIsLoading(false);
  }, []);

  const toggleMCP = (mcpId: string) => {
    const newSelected = new Set(selectedMCPs);
    if (newSelected.has(mcpId)) {
      newSelected.delete(mcpId);
    } else {
      newSelected.add(mcpId);
    }
    setSelectedMCPs(newSelected);
    localStorage.setItem('planjo-selected-mcps', JSON.stringify(Array.from(newSelected)));
  };

  const handleAddMCP = () => {
    if (!newMCP.name || !newMCP.url) {
      return;
    }

    const mcp: MCP = {
      id: `custom-${Date.now()}`,
      name: newMCP.name,
      category: newMCP.category,
      description: newMCP.description,
      url: newMCP.url,
      code: newMCP.code,
      isCustom: true,
    };

    const updatedCustomMCPs = [...customMCPs, mcp];
    setCustomMCPs(updatedCustomMCPs);
    localStorage.setItem('planjo-custom-mcps', JSON.stringify(updatedCustomMCPs));

    // Reset form
    setNewMCP({
      name: '',
      category: 'Custom',
      description: '',
      url: '',
      code: '',
    });
    setAddMCPDialogOpen(false);
  };

  const handleDeleteMCP = (mcpId: string) => {
    const updatedCustomMCPs = customMCPs.filter((m) => m.id !== mcpId);
    setCustomMCPs(updatedCustomMCPs);
    localStorage.setItem('planjo-custom-mcps', JSON.stringify(updatedCustomMCPs));

    // Also remove from selected MCPs
    const newSelected = new Set(selectedMCPs);
    newSelected.delete(mcpId);
    setSelectedMCPs(newSelected);
    localStorage.setItem('planjo-selected-mcps', JSON.stringify(Array.from(newSelected)));
  };

  const allMCPs = [...MCPS_DATA, ...customMCPs];
  const categories = Array.from(new Set(allMCPs.map((m) => m.category)));

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Model Context Protocol Servers</h1>
          </div>
          <Button
            onClick={() => setAddMCPDialogOpen(true)}
            className="rounded-full bg-[#8c6ff7] hover:bg-[#8c6ff7]/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add MCP
          </Button>
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#38f8c7]" />
            <span className="text-white/60">{selectedMCPs.size} MCPs active</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {categories.map((category) => (
          <div key={category} className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-white/90">{category}</h2>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {allMCPs.filter((m) => m.category === category).map((mcp) => (
                <MCPCard
                  key={mcp.id}
                  mcp={mcp}
                  isSelected={selectedMCPs.has(mcp.id)}
                  onToggle={() => toggleMCP(mcp.id)}
                  onClick={() => setSelectedMCP(mcp)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedMCP && (
        <MCPModal
          mcp={selectedMCP}
          onClose={() => setSelectedMCP(null)}
          onDelete={selectedMCP.isCustom ? () => {
            handleDeleteMCP(selectedMCP.id);
            setSelectedMCP(null);
          } : undefined}
        />
      )}

      <Dialog open={addMCPDialogOpen} onOpenChange={setAddMCPDialogOpen}>
        <DialogContent className="rounded-[28px] border-white/12 bg-slate-950/95 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Custom MCP Server</DialogTitle>
            <DialogDescription>
              Add your own MCP servers to extend AI capabilities
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="mcp-name">MCP Name *</Label>
              <Input
                id="mcp-name"
                value={newMCP.name}
                onChange={(e) => setNewMCP({ ...newMCP, name: e.target.value })}
                placeholder="e.g., My Custom MCP"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="mcp-category">Category</Label>
              <Select
                value={newMCP.category}
                onValueChange={(value) => setNewMCP({ ...newMCP, category: value })}
              >
                <SelectTrigger id="mcp-category" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="mcp-url">GitHub URL *</Label>
              <Input
                id="mcp-url"
                value={newMCP.url}
                onChange={(e) => setNewMCP({ ...newMCP, url: e.target.value })}
                placeholder="https://github.com/..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="mcp-description">Description</Label>
              <Textarea
                id="mcp-description"
                value={newMCP.description}
                onChange={(e) => setNewMCP({ ...newMCP, description: e.target.value })}
                placeholder="What does this MCP server do?"
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="mcp-code">Installation Code</Label>
              <Textarea
                id="mcp-code"
                value={newMCP.code}
                onChange={(e) => setNewMCP({ ...newMCP, code: e.target.value })}
                placeholder="npx -y @modelcontextprotocol/server-..."
                className="mt-1 font-mono text-sm"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setAddMCPDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddMCP}
                disabled={!newMCP.name || !newMCP.url}
                className="bg-[#8c6ff7] hover:bg-[#8c6ff7]/90"
              >
                Add MCP
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

