import mongoose, { Schema, Model } from 'mongoose';
import { IActivityLog } from '@/types';

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    type: {
      type: String,
      enum: ['task_created', 'task_completed', 'task_moved', 'journal_entry', 'doc_created', 'project_created'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ projectId: 1, createdAt: -1 });

const ActivityLog: Model<IActivityLog> = 
  mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);

export default ActivityLog;

