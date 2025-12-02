import { Document, Types } from 'mongoose';

// ============================================================================
// ENUMS & TYPES
// ============================================================================

export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type CredentialCategory = 'files' | 'api-key' | 'password' | 'database-url' | 'env-var' | 'other';
export type ActivityType = 
  | 'task_created' 
  | 'task_completed' 
  | 'task_moved' 
  | 'journal_entry' 
  | 'doc_created' 
  | 'project_created';
export type Mood = 'great' | 'good' | 'okay' | 'struggling';

// ============================================================================
// USER
// ============================================================================

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// PROJECT
// ============================================================================

export interface IProject extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description?: string;
  colorTheme?: string;
  status: ProjectStatus;
  techStack?: string[];
  repoUrl?: string;
  startDate?: Date;
  targetDate?: Date;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectDashboardStat {
  projectId: string;
  totalTasks: number;
  completedTasks: number;
  upcomingTasks: number;
  overdueTasks: number;
  completionRate: number;
  daysToTarget?: number | null;
  nextDueDate?: Date | null;
  scheduleDelta?: number | null;
}

// ============================================================================
// KANBAN COLUMN
// ============================================================================

export interface IKanbanColumn extends Document {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  name: string;
  order: number;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// TASK
// ============================================================================

export interface ISubtask {
  _id: Types.ObjectId;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface ITask extends Document {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  columnId: Types.ObjectId;
  title: string;
  description?: string;
  status: string;
  priority: TaskPriority;
  labels: string[];
  tags: string[];
  subtasks: ISubtask[];
  position: number;
  order: number;
  parentTaskId?: Types.ObjectId;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  completedAt?: Date;
  archivedAt?: Date;
  isCloudTask?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// PARKING LOT
// ============================================================================

export interface IParkingLotItem extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description?: string;
  relatedProjectIds?: Types.ObjectId[];
  tags?: string[];
  priority: TaskPriority;
  convertedToTaskId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// CREDENTIAL (VAULT)
// ============================================================================

export interface ICredential extends Document {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  category: CredentialCategory;
  label: string;
  encryptedValue: string;
  url?: string;
  notes?: string;
  // File-specific fields (when category is 'files')
  filename?: string;
  mimeType?: string;
  size?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// VAULT FILE
// ============================================================================

export interface IVaultFile extends Document {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  filename: string;
  encryptedContent: string;
  mimeType?: string;
  size: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// DOCUMENT
// ============================================================================

export interface IDocument extends Document {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  linkedTaskIds?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// JOURNAL ENTRY
// ============================================================================

export interface IJournalEntry extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: Date;
  content: string;
  relatedProjectIds?: Types.ObjectId[];
  relatedTaskIds?: Types.ObjectId[];
  mood?: Mood;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ACTIVITY LOG
// ============================================================================

export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  projectId?: Types.ObjectId;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// ============================================================================
// PROMPT
// ============================================================================

export interface IPrompt extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  isFavorite?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// NOTE
// ============================================================================

export interface INote extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// CLIENT-SIDE TYPES (without Mongoose Document)
// ============================================================================

export type User = Omit<IUser, keyof Omit<Document, '_id'>>;
export type Project = Omit<IProject, keyof Omit<Document, '_id'>>;
export type KanbanColumn = Omit<IKanbanColumn, keyof Omit<Document, '_id'>>;
export type Task = Omit<ITask, keyof Omit<Document, '_id'>>;
export type Subtask = ISubtask;
export type ParkingLotItem = Omit<IParkingLotItem, keyof Omit<Document, '_id'>>;
export type Credential = Omit<ICredential, keyof Omit<Document, '_id'>>;
export type VaultFile = Omit<IVaultFile, keyof Omit<Document, '_id'>>;
export type DocumentType = Omit<IDocument, keyof Omit<Document, '_id'>>;
export type JournalEntry = Omit<IJournalEntry, keyof Omit<Document, '_id'>>;
export type ActivityLog = Omit<IActivityLog, keyof Omit<Document, '_id'>> & { _id?: string };
export type Prompt = Omit<IPrompt, keyof Omit<Document, '_id'>>;
export type Note = Omit<INote, keyof Omit<Document, '_id'>>;

export interface AnalyticsSnapshot {
  streak: {
    current: number;
    max: number;
  };
  tasksCompleted: number;
  weeklyVelocity: Record<string, number>;
  mostProductiveHour: number;
  hourlyActivity: Record<string, number>;
  activeDays: number;
}
