import mongoose, { Schema, Model } from 'mongoose';
import { ITask, ISubtask } from '@/types';

const SubtaskSchema = new Schema<ISubtask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const TaskSchema = new Schema<ITask>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Temporarily optional to handle existing data
      index: true,
    },
    columnId: {
      type: Schema.Types.ObjectId,
      ref: 'KanbanColumn',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
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
    labels: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    subtasks: {
      type: [SubtaskSchema],
      default: [],
    },
    position: {
      type: Number,
      required: true,
      default: 0,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    parentTaskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
    },
    dueDate: {
      type: Date,
    },
    estimatedHours: {
      type: Number,
    },
    actualHours: {
      type: Number,
    },
    completedAt: {
      type: Date,
    },
    archivedAt: {
      type: Date,
    },
    isCloudTask: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
TaskSchema.index({ projectId: 1, columnId: 1, order: 1 });
TaskSchema.index({ projectId: 1, status: 1, position: 1 });
TaskSchema.index({ userId: 1, dueDate: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ archivedAt: 1 });
TaskSchema.index({ userId: 1, archivedAt: 1, completedAt: 1 });

const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default Task;

