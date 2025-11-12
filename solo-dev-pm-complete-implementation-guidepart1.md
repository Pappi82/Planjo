# Solo Dev Project Manager - Complete Implementation Guide
## AI-Optimized Step-by-Step Development Plan

This guide provides explicit, sequential instructions for building a complete solo developer project management application. Follow these steps in order.

---

## Table of Contents
1. [Project Setup & Configuration](#phase-1-project-setup--configuration)
2. [Database Models & Schemas](#phase-2-database-models--schemas)
3. [Authentication System](#phase-3-authentication-system)
4. [Project Management](#phase-4-project-management)
5. [Task Management & Kanban](#phase-5-task-management--kanban)
6. [Parking Lot](#phase-6-parking-lot-idea-backlog)
7. [Secure Vault](#phase-7-secure-vault-credentials-storage)
8. [Documentation System](#phase-8-documentation-system)
9. [Code Journal](#phase-9-code-journal)
10. [Vibe Mode](#phase-10-vibe-mode-focus-view)
11. [Momentum Tracker](#phase-11-momentum-tracker-analytics)
12. [Polish & Deployment](#phase-12-polish--deployment)

---

## Technology Stack Summary

```json
{
  "frontend": {
    "framework": "Next.js 14+",
    "language": "TypeScript",
    "ui": "React 18+",
    "styling": "Tailwind CSS + shadcn/ui",
    "state": "Zustand",
    "dragDrop": "@dnd-kit/core",
    "icons": "lucide-react",
    "markdown": "react-markdown",
    "charts": "recharts"
  },
  "backend": {
    "runtime": "Node.js",
    "api": "Next.js API Routes",
    "auth": "NextAuth.js",
    "database": "MongoDB + Mongoose",
    "encryption": "crypto-js"
  },
  "deployment": {
    "hosting": "Vercel",
    "database": "MongoDB Atlas"
  }
}
```

---

# PHASE 1: Project Setup & Configuration

## Step 1.1: Initialize Next.js Project

```bash
# Create Next.js app with TypeScript and Tailwind
npx create-next-app@latest solo-dev-pm --typescript --tailwind --app --eslint
cd solo-dev-pm
```

## Step 1.2: Install Core Dependencies

```bash
# Database & Auth
npm install mongoose next-auth@latest bcryptjs
npm install -D @types/bcryptjs

# UI & Interaction
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install zustand
npm install lucide-react
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select
npm install @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-popover
npm install class-variance-authority clsx tailwind-merge

# Markdown & Rich Text
npm install react-markdown remark-gfm rehype-highlight
npm install @uiw/react-md-editor

# Charts & Analytics
npm install recharts date-fns

# Encryption
npm install crypto-js
npm install -D @types/crypto-js

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# Utilities
npm install dayjs nanoid
```

## Step 1.3: Initialize shadcn/ui

```bash
npx shadcn-ui@latest init
```

When prompted, select:
- Style: Default
- Base color: Slate
- CSS variables: Yes

## Step 1.4: Install shadcn/ui Components

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add progress
```

## Step 1.5: Create Project Directory Structure

Create the following folder structure:

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── board/
│   │   │       │   └── page.tsx
│   │   │       ├── list/
│   │   │       │   └── page.tsx
│   │   │       ├── vault/
│   │   │       │   └── page.tsx
│   │   │       └── docs/
│   │   │           └── page.tsx
│   │   ├── parking-lot/
│   │   │   └── page.tsx
│   │   ├── journal/
│   │   │   └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── projects/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── tasks/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── columns/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── parking-lot/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── credentials/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── documents/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── journal/
│   │   │   ├── route.ts
│   │   │   └── [date]/
│   │   │       └── route.ts
│   │   └── analytics/
│   │       └── route.ts
│   ├── vibe/
│   │   └── [taskId]/
│   │       └── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                   # shadcn components (auto-generated)
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── MainLayout.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectGrid.tsx
│   │   ├── ProjectForm.tsx
│   │   └── ProjectDetails.tsx
│   ├── tasks/
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskDetail.tsx
│   │   └── SubtaskList.tsx
│   ├── kanban/
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   ├── KanbanCard.tsx
│   │   └── ColumnManager.tsx
│   ├── parking-lot/
│   │   ├── IdeaCard.tsx
│   │   ├── IdeaForm.tsx
│   │   └── ConvertToTaskDialog.tsx
│   ├── vault/
│   │   ├── CredentialCard.tsx
│   │   ├── CredentialForm.tsx
│   │   └── PasswordGenerator.tsx
│   ├── docs/
│   │   ├── DocumentEditor.tsx
│   │   ├── DocumentList.tsx
│   │   └── DocumentSidebar.tsx
│   ├── journal/
│   │   ├── JournalEntry.tsx
│   │   ├── JournalTimeline.tsx
│   │   └── QuickEntry.tsx
│   ├── vibe/
│   │   ├── VibeContainer.tsx
│   │   ├── PomodoroTimer.tsx
│   │   └── VibeScratchpad.tsx
│   ├── analytics/
│   │   ├── StreakDisplay.tsx
│   │   ├── VelocityChart.tsx
│   │   ├── TimeDistributionChart.tsx
│   │   └── ProductivityHeatmap.tsx
│   └── shared/
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── QuickAddButton.tsx
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── encryption.ts
│   ├── utils.ts
│   ├── constants.ts
│   └── activity-tracker.ts
├── models/
│   ├── User.ts
│   ├── Project.ts
│   ├── Task.ts
│   ├── KanbanColumn.ts
│   ├── ParkingLotItem.ts
│   ├── Credential.ts
│   ├── Document.ts
│   ├── JournalEntry.ts
│   └── ActivityLog.ts
├── hooks/
│   ├── useProjects.ts
│   ├── useTasks.ts
│   ├── useKeyboardShortcuts.ts
│   ├── useActivityTracker.ts
│   └── useLocalStorage.ts
├── stores/
│   └── useAppStore.ts
└── types/
    └── index.ts
```

## Step 1.6: Configure Environment Variables

Create `.env.local` file in root:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/solo-dev-pm?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_SECRET=generate_a_random_secret_here_use_openssl_rand_base64_32
NEXTAUTH_URL=http://localhost:3000

# Encryption (for vault)
ENCRYPTION_KEY=generate_another_random_secret_here_use_openssl_rand_base64_32
```

Create `.env.example` file:

```env
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
ENCRYPTION_KEY=
```

## Step 1.7: Update Tailwind Configuration

Update `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

## Step 1.8: Update Global CSS

Update `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 262.1 83.3% 57.8%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 262.1 83.3% 57.8%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 262.1 83.3% 57.8%;
    --primary-foreground: 210 40% 98%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 262.1 83.3% 57.8%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

# PHASE 2: Database Models & Schemas

## Step 2.1: Create Database Connection

Create `src/lib/db.ts`:

```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
```

## Step 2.2: Create Type Definitions

Create `src/types/index.ts`:

```typescript
import { ObjectId } from 'mongoose';

export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type CredentialCategory = 'api-key' | 'password' | 'database-url' | 'env-var' | 'other';
export type ActivityType = 'task_created' | 'task_completed' | 'task_moved' | 'journal_entry' | 'doc_created' | 'project_created';
export type Mood = 'great' | 'good' | 'okay' | 'struggling';

export interface IUser {
  _id: ObjectId;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProject {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  description: string;
  colorTheme: string;
  status: ProjectStatus;
  techStack: string[];
  repoUrl?: string;
  startDate: Date;
  targetDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
}

export interface ITask {
  _id: ObjectId;
  projectId: ObjectId;
  userId: ObjectId;
  title: string;
  description: string;
  status: string;
  priority: TaskPriority;
  labels: string[];
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  position: number;
  parentTaskId?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface IKanbanColumn {
  _id: ObjectId;
  projectId: ObjectId;
  name: string;
  position: number;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IParkingLotItem {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  description: string;
  relatedProjectIds: ObjectId[];
  tags: string[];
  priority: TaskPriority;
  convertedToTaskId?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICredential {
  _id: ObjectId;
  projectId: ObjectId;
  userId: ObjectId;
  category: CredentialCategory;
  label: string;
  encryptedValue: string;
  url?: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDocument {
  _id: ObjectId;
  projectId: ObjectId;
  userId: ObjectId;
  title: string;
  content: string;
  category: string;
  tags: string[];
  linkedTaskIds: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IJournalEntry {
  _id: ObjectId;
  userId: ObjectId;
  date: Date;
  content: string;
  relatedProjectIds: ObjectId[];
  relatedTaskIds: ObjectId[];
  mood?: Mood;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivityLog {
  _id: ObjectId;
  userId: ObjectId;
  date: Date;
  actionType: ActivityType;
  projectId?: ObjectId;
  taskId?: ObjectId;
  metadata: Record<string, any>;
  timestamp: Date;
}
```

## Step 2.3: Create User Model

Create `src/models/User.ts`:

```typescript
import mongoose, { Schema, Model } from 'mongoose';
import { IUser } from '@/types';

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
```

## Step 2.4: Create Project Model

Create `src/models/Project.ts`:

```typescript
import mongoose, { Schema, Model } from 'mongoose';
import { IProject } from '@/types';

const ProjectSchema = new Schema<IProject>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  colorTheme: {
    type: String,
    default: '#8B5CF6',
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'on-hold', 'completed'],
    default: 'planning',
  },
  techStack: [{
    type: String,
  }],
  repoUrl: {
    type: String,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  targetDate: {
    type: Date,
  },
  archivedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index for faster queries
ProjectSchema.index({ userId: 1, status: 1 });

const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
```

## Step 2.5: Create Task Model

Create `src/models/Task.ts`:

```typescript
import mongoose, { Schema, Model } from 'mongoose';
import { ITask } from '@/types';

const TaskSchema = new Schema<ITask>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    required: true,
    default: 'To Do',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  labels: [{
    type: String,
  }],
  dueDate: {
    type: Date,
  },
  estimatedHours: {
    type: Number,
  },
  actualHours: {
    type: Number,
  },
  position: {
    type: Number,
    required: true,
  },
  parentTaskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
  },
  completedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
TaskSchema.index({ projectId: 1, status: 1, position: 1 });
TaskSchema.index({ userId: 1, dueDate: 1 });

const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default Task;
```

## Step 2.6: Create Kanban Column Model

Create `src/models/KanbanColumn.ts`:

```typescript
import mongoose, { Schema, Model } from 'mongoose';
import { IKanbanColumn } from '@/types';

const KanbanColumnSchema = new Schema<IKanbanColumn>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    default: '#6B7280',
  },
}, {
  timestamps: true,
});

// Index for faster queries
KanbanColumnSchema.index({ projectId: 1, position: 1 });

const KanbanColumn: Model<IKanbanColumn> = mongoose.models.KanbanColumn || mongoose.model<IKanbanColumn>('KanbanColumn', KanbanColumnSchema);

export default KanbanColumn;
```

## Step 2.7: Create Parking Lot Model

Create `src/models/ParkingLotItem.ts`:

```typescript
import mongoose, { Schema, Model } from 'mongoose';
import { IParkingLotItem } from '@/types';

const ParkingLotItemSchema = new Schema<IParkingLotItem>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  relatedProjectIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Project',
  }],
  tags: [{
    type: String,
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  convertedToTaskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
  },
}, {
  timestamps: true,
});

// Index for faster queries
ParkingLotItemSchema.index({ userId: 1, createdAt: -1 });

const ParkingLotItem: Model<IParkingLotItem> = mongoose.models.ParkingLotItem || mongoose.model<IParkingLotItem>('ParkingLotItem', ParkingLotItemSchema);

export default ParkingLotItem;
```

## Step 2.8: Create Credential Model

Create `src/models/Credential.ts`:

```typescript
import mongoose, { Schema, Model } from 'mongoose';
import { ICredential } from '@/types';

const CredentialSchema = new Schema<ICredential>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['api-key', 'password', 'database-url', 'env-var', 'other'],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  encryptedValue: {
    type: String,
    required: true,
  },
  url: {
    type: String,
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Index for faster queries
CredentialSchema.index({ projectId: 1, userId: 1 });

const Credential: Model<ICredential> = mongoose.models.Credential || mongoose.model<ICredential>('Credential', CredentialSchema);

export default Credential;
```

## Step 2.9: Create Document Model

Create `src/models/Document.ts`:

```typescript
import mongoose, { Schema, Model } from 'mongoose';
import { IDocument } from '@/types';

const DocumentSchema = new Schema<IDocument>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: 'General',
  },
  tags: [{
    type: String,
  }],
  linkedTaskIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Task',
  }],
}, {
  timestamps: true,
});

// Index for faster queries and full-text search
DocumentSchema.index({ projectId: 1, userId: 1 });
DocumentSchema.index({ title: 'text', content: 'text' });

const Document: Model<IDocument> = mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);

export default Document;
```

## Step 2.10: Create Journal Entry Model

Create `src/models/JournalEntry.ts`:

```typescript
import mongoose, { Schema, Model } from 'mongoose';
import { IJournalEntry } from '@/types';

const JournalEntrySchema = new Schema<IJournalEntry>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  content: {
    type: String,
    default: '',
  },
  relatedProjectIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Project',
  }],
  relatedTaskIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Task',
  }],
  mood: {
    type: String,
    enum: ['great', 'good', 'okay', 'struggling'],
  },
}, {
  timestamps: true,
});

// Index for faster queries
JournalEntrySchema.index({ userId: 1, date: -1 });

const JournalEntry: Model<IJournalEntry> = mongoose.models.JournalEntry || mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema);

export default JournalEntry;
```

## Step 2.11: Create Activity Log Model

Create `src/models/ActivityLog.ts`:

```typescript
import mongoose, { Schema, Model } from 'mongoose';
import { IActivityLog } from '@/types';

const ActivityLogSchema = new Schema<IActivityLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  actionType: {
    type: String,
    enum: ['task_created', 'task_completed', 'task_moved', 'journal_entry', 'doc_created', 'project_created'],
    required: true,
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
  },
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
ActivityLogSchema.index({ userId: 1, date: -1 });
ActivityLogSchema.index({ userId: 1, actionType: 1 });

const ActivityLog: Model<IActivityLog> = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);

export default ActivityLog;
```

---

# PHASE 3: Authentication System

## Step 3.1: Create Encryption Utility

Create `src/lib/encryption.ts`:

```typescript
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
```

## Step 3.2: Create Utility Functions

Create `src/lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
```

## Step 3.3: Create Constants

Create `src/lib/constants.ts`:

```typescript
export const PROJECT_STATUSES = [
  { value: 'planning', label: 'Planning', color: '#6B7280' },
  { value: 'active', label: 'Active', color: '#10B981' },
  { value: 'on-hold', label: 'On Hold', color: '#F59E0B' },
  { value: 'completed', label: 'Completed', color: '#8B5CF6' },
] as const;

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', color: '#6B7280' },
  { value: 'medium', label: 'Medium', color: '#3B82F6' },
  { value: 'high', label: 'High', color: '#F59E0B' },
  { value: 'urgent', label: 'Urgent', color: '#EF4444' },
] as const;

export const DEFAULT_KANBAN_COLUMNS = [
  { name: 'Backlog', position: 0, color: '#6B7280' },
  { name: 'To Do', position: 1, color: '#3B82F6' },
  { name: 'In Progress', position: 2, color: '#F59E0B' },
  { name: 'Testing', position: 3, color: '#8B5CF6' },
  { name: 'Done', position: 4, color: '#10B981' },
] as const;

export const CREDENTIAL_CATEGORIES = [
  { value: 'api-key', label: 'API Key' },
  { value: 'password', label: 'Password' },
  { value: 'database-url', label: 'Database URL' },
  { value: 'env-var', label: 'Environment Variable' },
  { value: 'other', label: 'Other' },
] as const;

export const MOOD_OPTIONS = [
  { value: 'great', label: '🎉 Great', color: '#10B981' },
  { value: 'good', label: '😊 Good', color: '#3B82F6' },
  { value: 'okay', label: '😐 Okay', color: '#F59E0B' },
  { value: 'struggling', label: '😓 Struggling', color: '#EF4444' },
] as const;

export const TECH_STACK_OPTIONS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'Express',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Python', 'Django', 'Flask',
  'Vue.js', 'Angular', 'Svelte', 'Tailwind CSS', 'GraphQL', 'REST API',
  'Docker', 'Kubernetes', 'AWS', 'Vercel', 'Netlify', 'Firebase'
] as const;

export const KEYBOARD_SHORTCUTS = {
  QUICK_SEARCH: 'cmd+k',
  NEW_TASK: 'cmd+n',
  NEW_PROJECT: 'cmd+shift+n',
  JOURNAL: 'cmd+j',
  PARKING_LOT: 'cmd+p',
  VIBE_MODE: 'cmd+f',
  TOGGLE_DARK: 'cmd+d',
  TOGGLE_SIDEBAR: 'cmd+b',
  SHOW_SHORTCUTS: 'cmd+/',
} as const;
```

## Step 3.4: Set Up NextAuth

Create `src/lib/auth.ts`:

```typescript
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from './db';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error('No user found');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
```

## Step 3.5: Create NextAuth API Route

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

## Step 3.6: Update NextAuth Types

Create `src/types/next-auth.d.ts`:

```typescript
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}
```

## Step 3.7: Create Register API Route

Create `src/app/api/auth/register/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
    });

    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Step 3.8: Create Login Page

Create `src/app/(auth)/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
```

## Step 3.9: Create Register Page

Create `src/app/(auth)/register/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong');
        return;
      }

      router.push('/login?registered=true');
    } catch (error) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Sign up to get started</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
```

---

# PHASE 4: Project Management

## Step 4.1: Create Projects API Routes

Create `src/app/api/projects/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import KanbanColumn from '@/models/KanbanColumn';
import { DEFAULT_KANBAN_COLUMNS } from '@/lib/constants';

// GET all projects
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const projects = await Project.find({ 
      userId: session.user.id,
      archivedAt: null 
    }).sort({ updatedAt: -1 });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new project
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, colorTheme, status, techStack, repoUrl, targetDate } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Create project
    const project = await Project.create({
      userId: session.user.id,
      title,
      description,
      colorTheme: colorTheme || '#8B5CF6',
      status: status || 'planning',
      techStack: techStack || [],
      repoUrl,
      targetDate,
    });

    // Create default Kanban columns for this project
    const columns = await KanbanColumn.insertMany(
      DEFAULT_KANBAN_COLUMNS.map((col) => ({
        projectId: project._id,
        ...col,
      }))
    );

    return NextResponse.json(
      { project, columns },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Create `src/app/api/projects/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';

// GET single project
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

    const project = await Project.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update project
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

    const project = await Project.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE archive project
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

    const project = await Project.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { $set: { archivedAt: new Date() } },
      { new: true }
    );

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Archive project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Step 4.2: Create Project Hook

Create `src/hooks/useProjects.ts`:

```typescript
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR('/api/projects', fetcher);

  return {
    projects: data?.projects || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useProject(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/projects/${id}` : null,
    fetcher
  );

  return {
    project: data?.project,
    isLoading,
    isError: error,
    mutate,
  };
}
```

## Step 4.3: Create Project Components

Create `src/components/projects/ProjectCard.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { IProject } from '@/types';
import { Calendar, GitBranch } from 'lucide-react';

interface ProjectCardProps {
  project: IProject;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project._id}`}>
      <Card 
        className="hover:shadow-lg transition-shadow cursor-pointer h-full"
        style={{ borderTop: `4px solid ${project.colorTheme}` }}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle>{project.title}</CardTitle>
              <CardDescription className="mt-2 line-clamp-2">
                {project.description || 'No description'}
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {project.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {project.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {project.techStack.slice(0, 3).map((tech) => (
                  <Badge key={tech} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
                {project.techStack.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{project.techStack.length - 3}
                  </Badge>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(project.startDate)}
              </div>
              {project.repoUrl && (
                <div className="flex items-center gap-1">
                  <GitBranch className="h-4 w-4" />
                  Repo
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

Create `src/components/projects/ProjectGrid.tsx`:

```typescript
'use client';

import ProjectCard from './ProjectCard';
import { IProject } from '@/types';

interface ProjectGridProps {
  projects: IProject[];
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No projects yet. Create your first one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project._id.toString()} project={project} />
      ))}
    </div>
  );
}
```

Create `src/components/projects/ProjectForm.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PROJECT_STATUSES, TECH_STACK_OPTIONS } from '@/lib/constants';
import { IProject } from '@/types';

interface ProjectFormProps {
  project?: IProject;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export default function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    colorTheme: project?.colorTheme || '#8B5CF6',
    status: project?.status || 'planning',
    techStack: project?.techStack || [],
    repoUrl: project?.repoUrl || '',
    targetDate: project?.targetDate ? new Date(project.targetDate).toISOString().split('T')[0] : '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Project Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="colorTheme">Color Theme</Label>
          <Input
            id="colorTheme"
            type="color"
            value={formData.colorTheme}
            onChange={(e) => setFormData({ ...formData, colorTheme: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="repoUrl">Repository URL</Label>
        <Input
          id="repoUrl"
          type="url"
          value={formData.repoUrl}
          onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetDate">Target Completion Date</Label>
        <Input
          id="targetDate"
          type="date"
          value={formData.targetDate}
          onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : project ? 'Update' : 'Create'} Project
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

## Step 4.4: Create Projects Page

Create `src/app/(dashboard)/projects/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ProjectGrid from '@/components/projects/ProjectGrid';
import ProjectForm from '@/components/projects/ProjectForm';
import { useProjects } from '@/hooks/useProjects';
import { Plus } from 'lucide-react';

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, isLoading, mutate } = useProjects();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateProject = async (data: any) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      mutate();
      setDialogOpen(false);
      const { project } = await res.json();
      router.push(`/projects/${project._id}`);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading projects...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your development projects</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <ProjectForm
              onSubmit={handleCreateProject}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <ProjectGrid projects={projects} />
    </div>
  );
}
```

---

Due to the extensive length of this complete guide, I'll continue with the remaining phases (Task Management, Parking Lot, Vault, Documentation, Journal, Vibe Mode, and Momentum Tracker) in the same detailed format. 

**This implementation guide is approximately 40% complete. Would you like me to:**
1. Continue with the remaining phases in a second document?
2. Focus on specific features you want implemented first?
3. Provide all remaining phases now (will be very long)?

The complete guide will be approximately 15,000-20,000 lines of code and instructions when finished.
