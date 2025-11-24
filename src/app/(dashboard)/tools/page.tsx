'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Check, X } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
  icon?: string;
}

const TOOLS_DATA: Tool[] = [
  // AI Coding Assistants
  {
    id: 'cursor',
    name: 'Cursor',
    category: 'AI Coding',
    description: 'AI-first code editor built on VS Code. Features AI chat, code generation, and intelligent autocomplete. Perfect for rapid development and learning new frameworks.',
    url: 'https://cursor.sh',
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    category: 'AI Coding',
    description: 'AI pair programmer that suggests code and entire functions in real-time. Integrates seamlessly with VS Code, JetBrains IDEs, and more.',
    url: 'https://github.com/features/copilot',
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    category: 'AI Coding',
    description: 'Next-generation AI code editor with advanced flow detection and context awareness. Built for developers who value deep work and flow state.',
    url: 'https://codeium.com/windsurf',
  },
  {
    id: 'codeium',
    name: 'Codeium',
    category: 'AI Coding',
    description: 'Free AI-powered code completion and chat. Supports 70+ languages and integrates with all major IDEs. Great alternative to Copilot.',
    url: 'https://codeium.com',
  },
  {
    id: 'v0',
    name: 'v0 by Vercel',
    category: 'AI Coding',
    description: 'AI-powered UI generation tool. Describe your component and get production-ready React code with Tailwind CSS. Perfect for rapid prototyping.',
    url: 'https://v0.dev',
  },
  {
    id: 'bolt-new',
    name: 'Bolt.new',
    category: 'AI Coding',
    description: 'Full-stack web development in the browser powered by AI. Build, run, and deploy complete applications without local setup.',
    url: 'https://bolt.new',
  },

  // Code Editors & IDEs
  {
    id: 'vscode',
    name: 'VS Code',
    category: 'Editors',
    description: 'The most popular code editor. Highly extensible with thousands of extensions. Fast, lightweight, and works on all platforms.',
    url: 'https://code.visualstudio.com',
  },
  {
    id: 'webstorm',
    name: 'WebStorm',
    category: 'Editors',
    description: 'Powerful IDE for JavaScript and TypeScript. Built-in tools for testing, debugging, and version control. Great for large projects.',
    url: 'https://www.jetbrains.com/webstorm',
  },
  {
    id: 'zed',
    name: 'Zed',
    category: 'Editors',
    description: 'Lightning-fast, collaborative code editor built in Rust. Real-time collaboration and AI integration. The future of code editing.',
    url: 'https://zed.dev',
  },

  // Terminal & CLI
  {
    id: 'warp',
    name: 'Warp',
    category: 'Terminal',
    description: 'Modern terminal with AI command search, blocks for organizing output, and collaborative features. Makes CLI work feel like a modern app.',
    url: 'https://www.warp.dev',
  },
  {
    id: 'iterm2',
    name: 'iTerm2',
    category: 'Terminal',
    description: 'Powerful terminal replacement for macOS. Split panes, search, autocomplete, and extensive customization options.',
    url: 'https://iterm2.com',
  },
  {
    id: 'fig',
    name: 'Fig',
    category: 'Terminal',
    description: 'Adds IDE-style autocomplete to your terminal. Visual command suggestions and documentation as you type.',
    url: 'https://fig.io',
  },

  // Browsers
  {
    id: 'arc',
    name: 'Arc Browser',
    category: 'Browsers',
    description: 'Reimagined browser with vertical tabs, spaces for organizing work, and built-in tools. Changes how you think about browsing.',
    url: 'https://arc.net',
  },
  {
    id: 'chrome',
    name: 'Chrome DevTools',
    category: 'Browsers',
    description: 'Industry-standard browser with powerful developer tools. Best debugging experience and extensive extension ecosystem.',
    url: 'https://www.google.com/chrome',
  },
  {
    id: 'polypane',
    name: 'Polypane',
    category: 'Browsers',
    description: 'Browser built for developers. Test responsive designs, accessibility, and performance all in one window.',
    url: 'https://polypane.app',
  },

  // Design Tools
  {
    id: 'figma',
    name: 'Figma',
    category: 'Design',
    description: 'Collaborative interface design tool. Real-time collaboration, design systems, and developer handoff. Industry standard for UI/UX.',
    url: 'https://www.figma.com',
  },
  {
    id: 'framer',
    name: 'Framer',
    category: 'Design',
    description: 'Design and publish websites with no code. Interactive prototypes, CMS, and production-ready sites. Perfect for landing pages.',
    url: 'https://www.framer.com',
  },
  {
    id: 'spline',
    name: 'Spline',
    category: 'Design',
    description: '3D design tool for the web. Create interactive 3D experiences and export them directly to your website. Perfect for modern, immersive UIs.',
    url: 'https://spline.design',
  },

  // Productivity & Launcher
  {
    id: 'raycast',
    name: 'Raycast',
    category: 'Productivity',
    description: 'Blazingly fast launcher for Mac. Extensions for everything, clipboard history, window management, and AI commands. Replaces Spotlight.',
    url: 'https://www.raycast.com',
  },
  {
    id: 'linear',
    name: 'Linear',
    category: 'Productivity',
    description: 'Issue tracking built for high-performance teams. Beautiful UI, keyboard shortcuts, and Git integration. Makes project management feel fast.',
    url: 'https://linear.app',
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'Productivity',
    description: 'All-in-one workspace for notes, docs, wikis, and databases. Flexible and powerful. Great for documentation and knowledge management.',
    url: 'https://www.notion.so',
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    category: 'Productivity',
    description: 'Powerful knowledge base on top of local Markdown files. Graph view, plugins, and complete ownership of your data. Perfect for PKM.',
    url: 'https://obsidian.md',
  },
  {
    id: 'arc-max',
    name: 'Arc Max',
    category: 'Productivity',
    description: 'AI-powered features in Arc Browser. Ask questions about pages, auto-rename tabs, and get instant previews. Browsing meets AI.',
    url: 'https://arc.net/max',
  },

  // API & Testing
  {
    id: 'postman',
    name: 'Postman',
    category: 'API Testing',
    description: 'Complete API development platform. Test, document, and monitor APIs. Collaboration features and automated testing.',
    url: 'https://www.postman.com',
  },
  {
    id: 'insomnia',
    name: 'Insomnia',
    category: 'API Testing',
    description: 'Beautiful REST and GraphQL client. Clean interface, environment variables, and code generation. Great alternative to Postman.',
    url: 'https://insomnia.rest',
  },
  {
    id: 'hoppscotch',
    name: 'Hoppscotch',
    category: 'API Testing',
    description: 'Open-source API development ecosystem. Lightweight, fast, and works in the browser. Real-time collaboration and PWA support.',
    url: 'https://hoppscotch.io',
  },

  // Database Tools
  {
    id: 'tableplus',
    name: 'TablePlus',
    category: 'Database',
    description: 'Modern database management tool. Supports MySQL, PostgreSQL, SQLite, and more. Native, fast, and beautiful interface.',
    url: 'https://tableplus.com',
  },
  {
    id: 'datagrip',
    name: 'DataGrip',
    category: 'Database',
    description: 'Powerful database IDE by JetBrains. Intelligent query console, schema navigation, and version control integration.',
    url: 'https://www.jetbrains.com/datagrip',
  },
  {
    id: 'supabase',
    name: 'Supabase',
    category: 'Database',
    description: 'Open-source Firebase alternative. PostgreSQL database, authentication, storage, and real-time subscriptions. Self-hostable.',
    url: 'https://supabase.com',
  },

  // Deployment & Hosting
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'Deployment',
    description: 'Platform for frontend frameworks. Zero-config deployments, edge functions, and analytics. Built by the creators of Next.js.',
    url: 'https://vercel.com',
  },
  {
    id: 'netlify',
    name: 'Netlify',
    category: 'Deployment',
    description: 'All-in-one platform for modern web projects. Continuous deployment, serverless functions, and form handling. Great DX.',
    url: 'https://www.netlify.com',
  },
  {
    id: 'railway',
    name: 'Railway',
    category: 'Deployment',
    description: 'Deploy from GitHub in seconds. Databases, cron jobs, and full-stack apps. Simple pricing and great developer experience.',
    url: 'https://railway.app',
  },
  {
    id: 'fly-io',
    name: 'Fly.io',
    category: 'Deployment',
    description: 'Run full-stack apps globally. Deploy Docker containers close to users. Great for low-latency applications.',
    url: 'https://fly.io',
  },

  // Version Control & Collaboration
  {
    id: 'github',
    name: 'GitHub',
    category: 'Version Control',
    description: 'The home of open source. Code hosting, CI/CD, project management, and collaboration. Essential for any developer.',
    url: 'https://github.com',
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    category: 'Version Control',
    description: 'Complete DevOps platform. Git repository, CI/CD, issue tracking, and more. Self-hostable and open-source.',
    url: 'https://gitlab.com',
  },
  {
    id: 'gitkraken',
    name: 'GitKraken',
    category: 'Version Control',
    description: 'Visual Git client with beautiful UI. Drag-and-drop commits, interactive rebase, and merge conflict editor. Makes Git intuitive.',
    url: 'https://www.gitkraken.com',
  },

  // Focus & Music
  {
    id: 'brain-fm',
    name: 'Brain.fm',
    category: 'Focus',
    description: 'Music designed to improve focus. Science-backed audio that helps you concentrate, relax, or sleep. Perfect for deep work sessions.',
    url: 'https://www.brain.fm',
  },
  {
    id: 'lofi-girl',
    name: 'Lofi Girl',
    category: 'Focus',
    description: 'Chill beats to code to. 24/7 livestream of lo-fi hip hop music. The iconic study companion for developers worldwide.',
    url: 'https://www.youtube.com/@LofiGirl',
  },
  {
    id: 'endel',
    name: 'Endel',
    category: 'Focus',
    description: 'Personalized soundscapes for focus, relaxation, and sleep. Adapts to time of day, weather, and heart rate. AI-powered ambient sound.',
    url: 'https://endel.io',
  },
  {
    id: 'flow-state',
    name: 'Flow State',
    category: 'Focus',
    description: 'Pomodoro timer with ambient sounds. Track your focus sessions, set goals, and build streaks. Minimal and distraction-free.',
    url: 'https://flowstate.app',
  },

  // Communication
  {
    id: 'discord',
    name: 'Discord',
    category: 'Communication',
    description: 'Voice, video, and text chat for communities. Screen sharing, bots, and integrations. Popular for dev communities and teams.',
    url: 'https://discord.com',
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    description: 'Business communication platform. Channels, threads, and extensive integrations. Standard for remote teams.',
    url: 'https://slack.com',
  },
  {
    id: 'loom',
    name: 'Loom',
    category: 'Communication',
    description: 'Async video messaging. Record your screen and camera, share instantly. Perfect for code reviews and demos.',
    url: 'https://www.loom.com',
  },

  // Package Managers & Tools
  {
    id: 'homebrew',
    name: 'Homebrew',
    category: 'Package Managers',
    description: 'The missing package manager for macOS. Install command-line tools and apps with simple commands. Essential for Mac developers.',
    url: 'https://brew.sh',
  },
  {
    id: 'npm',
    name: 'npm',
    category: 'Package Managers',
    description: 'Node package manager. Largest software registry in the world. Essential for JavaScript development.',
    url: 'https://www.npmjs.com',
  },
  {
    id: 'pnpm',
    name: 'pnpm',
    category: 'Package Managers',
    description: 'Fast, disk space efficient package manager. Symlinks packages from a single store. 2x faster than npm.',
    url: 'https://pnpm.io',
  },
  {
    id: 'bun',
    name: 'Bun',
    category: 'Package Managers',
    description: 'All-in-one JavaScript runtime and toolkit. Bundler, test runner, and package manager. Blazingly fast.',
    url: 'https://bun.sh',
  },

  // Monitoring & Analytics
  {
    id: 'sentry',
    name: 'Sentry',
    category: 'Monitoring',
    description: 'Error tracking and performance monitoring. Real-time alerts, stack traces, and release tracking. Essential for production apps.',
    url: 'https://sentry.io',
  },
  {
    id: 'posthog',
    name: 'PostHog',
    category: 'Monitoring',
    description: 'Open-source product analytics. Session recording, feature flags, and A/B testing. Self-hostable alternative to Mixpanel.',
    url: 'https://posthog.com',
  },
  {
    id: 'plausible',
    name: 'Plausible',
    category: 'Monitoring',
    description: 'Privacy-friendly analytics. Simple, lightweight, and GDPR compliant. Great alternative to Google Analytics.',
    url: 'https://plausible.io',
  },

  // Documentation
  {
    id: 'readme',
    name: 'ReadMe',
    category: 'Documentation',
    description: 'Beautiful API documentation. Interactive API explorer, guides, and changelogs. Used by Stripe, GitHub, and more.',
    url: 'https://readme.com',
  },
  {
    id: 'docusaurus',
    name: 'Docusaurus',
    category: 'Documentation',
    description: 'Documentation website generator by Meta. Markdown-based, versioning, and i18n support. Powers React docs.',
    url: 'https://docusaurus.io',
  },
  {
    id: 'mintlify',
    name: 'Mintlify',
    category: 'Documentation',
    description: 'Modern documentation platform. Beautiful out of the box, API playground, and analytics. MDX-based.',
    url: 'https://mintlify.com',
  },

  // Screenshot & Recording
  {
    id: 'cleanshot',
    name: 'CleanShot X',
    category: 'Screenshots',
    description: 'Ultimate screenshot tool for Mac. Annotations, scrolling capture, and cloud upload. Professional screenshots in seconds.',
    url: 'https://cleanshot.com',
  },
  {
    id: 'screen-studio',
    name: 'Screen Studio',
    category: 'Screenshots',
    description: 'Beautiful screen recordings with automatic zoom and cursor effects. Perfect for product demos and tutorials.',
    url: 'https://www.screen.studio',
  },
];

interface ToolCardProps {
  tool: Tool;
  isSelected: boolean;
  onToggle: () => void;
  onClick: () => void;
}

function ToolCard({ tool, isSelected, onToggle, onClick }: ToolCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 ${
        isSelected
          ? 'border-[#38f8c7]/40 bg-white/10 shadow-[0_20px_40px_rgba(56,248,199,0.15)]'
          : 'border-white/10 bg-white/[0.05] hover:border-white/20 hover:bg-white/[0.08]'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#6f9eff]/20 blur-[60px]" />
      </div>

      <div className="relative z-10">
        <div className="mb-3 flex items-start justify-between">
          <button
            onClick={onClick}
            className="flex-1 text-left transition hover:opacity-80"
          >
            <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
            <p className="mt-1 text-xs uppercase tracking-wider text-white/50">
              {tool.category}
            </p>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
              isSelected
                ? 'border-[#38f8c7]/60 bg-[#38f8c7]/20 text-[#38f8c7]'
                : 'border-white/20 bg-white/5 text-white/40 hover:border-white/40 hover:bg-white/10 hover:text-white/60'
            }`}
          >
            {isSelected ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </button>
        </div>

        <p className="mb-4 line-clamp-2 text-sm text-white/60">{tool.description}</p>

        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-2 text-xs text-[#8c6ff7] transition hover:text-[#6f9eff]"
        >
          Visit site
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

interface ToolModalProps {
  tool: Tool;
  onClose: () => void;
}

function ToolModal({ tool, onClose }: ToolModalProps) {
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
              <h2 className="text-3xl font-bold text-white">{tool.name}</h2>
              <p className="mt-2 text-sm uppercase tracking-wider text-white/50">
                {tool.category}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full border border-white/20 bg-white/5 p-2 text-white/60 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="mb-6 text-white/80">{tool.description}</p>

          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[#8c6ff7]/40 bg-[#8c6ff7]/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#8c6ff7]/60 hover:bg-[#8c6ff7]/20"
          >
            Visit {tool.name}
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ToolsPage() {
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load selected tools from localStorage
    const saved = localStorage.getItem('planjo-selected-tools');
    if (saved) {
      setSelectedTools(new Set(JSON.parse(saved)));
    }
    setIsLoading(false);
  }, []);

  const toggleTool = (toolId: string) => {
    const newSelected = new Set(selectedTools);
    if (newSelected.has(toolId)) {
      newSelected.delete(toolId);
    } else {
      newSelected.add(toolId);
    }
    setSelectedTools(newSelected);
    localStorage.setItem('planjo-selected-tools', JSON.stringify(Array.from(newSelected)));
  };

  const categories = Array.from(new Set(TOOLS_DATA.map((t) => t.category)));

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
        <h1 className="text-4xl font-bold text-white">Vibe Coder Tools</h1>
        <p className="mt-2 text-white/60">
          Curate your perfect dev stack. Click tools to see details, select the ones you use.
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#38f8c7]" />
            <span className="text-white/60">{selectedTools.size} tools selected</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {categories.map((category) => (
          <div key={category} className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-white/90">{category}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TOOLS_DATA.filter((t) => t.category === category).map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  isSelected={selectedTools.has(tool.id)}
                  onToggle={() => toggleTool(tool.id)}
                  onClick={() => setSelectedTool(tool)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedTool && (
        <ToolModal tool={selectedTool} onClose={() => setSelectedTool(null)} />
      )}
    </div>
  );
}

