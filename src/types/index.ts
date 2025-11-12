import { Document, Types } from 'mongoose';

// ============================================================================
// ENUMS & TYPES
// ============================================================================

export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type CredentialCategory = 'api-key' | 'password' | 'database-url' | 'env-var' | 'other';
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
  name: string;
  description?: string;
  status: ProjectStatus;
  color: string;
  techStack: string[];
  startDate?: Date;
  endDate?: Date;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// PARKING LOT
// ============================================================================

export interface IParkingLotItem extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  projectId?: Types.ObjectId;
  title: string;
  description?: string;
  tags: string[];
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
  name: string;
  category: CredentialCategory;
  encryptedValue: string;
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
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
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
  mood: Mood;
  content: string;
  wins: string[];
  challenges: string[];
  learnings: string[];
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
// CLIENT-SIDE TYPES (without Mongoose Document)
// ============================================================================

export type User = Omit<IUser, keyof Omit<Document, '_id'>>;
export type Project = Omit<IProject, keyof Omit<Document, '_id'>>;
export type KanbanColumn = Omit<IKanbanColumn, keyof Omit<Document, '_id'>>;
export type Task = Omit<ITask, keyof Omit<Document, '_id'>>;
export type Subtask = ISubtask;
export type ParkingLotItem = Omit<IParkingLotItem, keyof Document>;
export type Credential = Omit<ICredential, keyof Document>;
export type DocumentType = Omit<IDocument, keyof Document>;
export type JournalEntry = Omit<IJournalEntry, keyof Document>;
export type ActivityLog = Omit<IActivityLog, keyof Document>;

