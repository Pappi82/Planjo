'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Check, X, CheckCircle2, Circle } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
  icon?: string;
}

const TOOLS_DATA: Tool[] = [
  // AI LLM Models
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    category: 'AI Models',
    description: 'OpenAI\'s flagship conversational AI. GPT-4 and GPT-4o models for coding, writing, analysis, and problem-solving. Web interface, API, and mobile apps available.',
    url: 'https://chat.openai.com',
  },
  {
    id: 'claude',
    name: 'Claude',
    category: 'AI Models',
    description: 'Anthropic\'s AI assistant with extended context windows (200K tokens). Excellent for code analysis, documentation, and complex reasoning. Claude 3.5 Sonnet is state-of-the-art.',
    url: 'https://claude.ai',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    category: 'AI Models',
    description: 'Google\'s multimodal AI model. Gemini Pro and Ultra for text, code, images, and video. Deep integration with Google Workspace and developer tools.',
    url: 'https://gemini.google.com',
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    category: 'AI Models',
    description: 'AI-powered search engine with real-time web access. Provides cited sources and up-to-date information. Perfect for research and learning.',
    url: 'https://www.perplexity.ai',
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    category: 'AI Models',
    description: 'European AI company with powerful open-source models. Mistral Large and Mixtral for coding and reasoning. API and self-hosted options.',
    url: 'https://mistral.ai',
  },
  {
    id: 'llama',
    name: 'Meta Llama',
    category: 'AI Models',
    description: 'Meta\'s open-source LLM family. Llama 3.1 with 405B parameters. Run locally or via cloud providers. Great for privacy-conscious developers.',
    url: 'https://llama.meta.com',
  },
  {
    id: 'grok',
    name: 'Grok (xAI)',
    category: 'AI Models',
    description: 'Elon Musk\'s AI with real-time X (Twitter) integration. Grok-2 for conversational AI with personality. Access via X Premium.',
    url: 'https://x.ai',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    category: 'AI Models',
    description: 'Chinese AI lab with powerful coding models. DeepSeek Coder excels at code generation and debugging. Open-source and API available.',
    url: 'https://www.deepseek.com',
  },
  {
    id: 'cohere',
    name: 'Cohere',
    category: 'AI Models',
    description: 'Enterprise-focused LLM platform. Command R+ for RAG and search. Multilingual support and customizable models.',
    url: 'https://cohere.com',
  },

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
  {
    id: 'replit-ai',
    name: 'Replit AI',
    category: 'AI Coding',
    description: 'AI-powered collaborative coding environment. Code, deploy, and collaborate in the browser. Ghostwriter AI for code completion and generation.',
    url: 'https://replit.com',
  },
  {
    id: 'tabnine',
    name: 'Tabnine',
    category: 'AI Coding',
    description: 'AI code completion trained on your codebase. Privacy-focused with local and cloud options. Supports all major IDEs and languages.',
    url: 'https://www.tabnine.com',
  },
  {
    id: 'amazon-q',
    name: 'Amazon Q Developer',
    category: 'AI Coding',
    description: 'AWS\'s AI coding assistant. Code generation, security scanning, and AWS integration. Free tier available for individual developers.',
    url: 'https://aws.amazon.com/q/developer',
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
  {
    id: 'obs-studio',
    name: 'OBS Studio',
    category: 'Screenshots',
    description: 'Free and open-source streaming and recording software. Professional-grade features for tutorials, streams, and demos.',
    url: 'https://obsproject.com',
  },

  // AI Image & Design Tools
  {
    id: 'midjourney',
    name: 'Midjourney',
    category: 'AI Design',
    description: 'Leading AI image generation tool. Create stunning visuals from text prompts. Perfect for UI mockups, illustrations, and creative assets.',
    url: 'https://www.midjourney.com',
  },
  {
    id: 'dall-e',
    name: 'DALL-E 3',
    category: 'AI Design',
    description: 'OpenAI\'s image generation model. Integrated with ChatGPT Plus. Excellent for precise image generation and editing.',
    url: 'https://openai.com/dall-e-3',
  },
  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion',
    category: 'AI Design',
    description: 'Open-source AI image generation. Run locally or via cloud. Highly customizable with LoRAs and ControlNet.',
    url: 'https://stability.ai',
  },
  {
    id: 'leonardo-ai',
    name: 'Leonardo.ai',
    category: 'AI Design',
    description: 'AI art generator with game asset focus. Consistent character generation, image-to-image, and canvas editing.',
    url: 'https://leonardo.ai',
  },
  {
    id: 'runway',
    name: 'Runway',
    category: 'AI Design',
    description: 'AI video and image editing suite. Gen-2 for video generation, background removal, and motion tracking. Creative AI tools.',
    url: 'https://runwayml.com',
  },

  // Developer Tools & Utilities
  {
    id: 'regex101',
    name: 'Regex101',
    category: 'Dev Tools',
    description: 'Online regex tester and debugger. Real-time matching, explanation, and code generation. Supports multiple flavors.',
    url: 'https://regex101.com',
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    category: 'Dev Tools',
    description: 'Format, validate, and visualize JSON data. Tree view, search, and comparison tools. Essential for API development.',
    url: 'https://jsonformatter.org',
  },
  {
    id: 'crontab-guru',
    name: 'Crontab Guru',
    category: 'Dev Tools',
    description: 'Cron schedule expression editor. Visual interface for creating and understanding cron jobs. Quick reference and examples.',
    url: 'https://crontab.guru',
  },
  {
    id: 'transform-tools',
    name: 'Transform',
    category: 'Dev Tools',
    description: 'Convert between data formats. JSON to TypeScript, GraphQL to TypeScript, and more. Polyglot code generation.',
    url: 'https://transform.tools',
  },
  {
    id: 'devdocs',
    name: 'DevDocs',
    category: 'Dev Tools',
    description: 'Unified documentation browser. Offline access to 100+ API docs. Fast search and keyboard shortcuts.',
    url: 'https://devdocs.io',
  },
  {
    id: 'can-i-use',
    name: 'Can I Use',
    category: 'Dev Tools',
    description: 'Browser compatibility tables for web technologies. Check CSS, HTML, and JavaScript feature support across browsers.',
    url: 'https://caniuse.com',
  },

  // Learning & Resources
  {
    id: 'frontend-mentor',
    name: 'Frontend Mentor',
    category: 'Learning',
    description: 'Real-world frontend challenges. Design files, assets, and community feedback. Build portfolio projects.',
    url: 'https://www.frontendmentor.io',
  },
  {
    id: 'exercism',
    name: 'Exercism',
    category: 'Learning',
    description: 'Free coding exercises with mentorship. 60+ programming languages. Learn through practice and feedback.',
    url: 'https://exercism.org',
  },
  {
    id: 'roadmap-sh',
    name: 'Roadmap.sh',
    category: 'Learning',
    description: 'Developer roadmaps and learning paths. Visual guides for frontend, backend, DevOps, and more. Community-driven.',
    url: 'https://roadmap.sh',
  },
  {
    id: 'daily-dev',
    name: 'daily.dev',
    category: 'Learning',
    description: 'Personalized dev news feed. Curated articles, tutorials, and discussions. Browser extension and web app.',
    url: 'https://daily.dev',
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
          <h3 className="text-base font-semibold text-white truncate">{tool.name}</h3>
          <p className="mt-0.5 text-xs text-white/50 truncate">
            {tool.category}
          </p>
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
          Curate your perfect dev stack. Click cards for details, tap the circle to activate tools you use.
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#38f8c7]" />
            <span className="text-white/60">{selectedTools.size} tools active</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {categories.map((category) => (
          <div key={category} className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-white/90">{category}</h2>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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

