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
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    tags: {
      type: [String],
      default: [],
    },
    subtasks: {
      type: [SubtaskSchema],
      default: [],
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    dueDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
TaskSchema.index({ projectId: 1, columnId: 1, order: 1 });
TaskSchema.index({ dueDate: 1 });

const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default Task;

