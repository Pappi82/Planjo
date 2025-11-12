import mongoose, { Schema, Model } from 'mongoose';
import { IProject } from '@/types';

const ProjectSchema = new Schema<IProject>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'on-hold', 'completed'],
      default: 'planning',
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
    techStack: {
      type: [String],
      default: [],
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    archived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ProjectSchema.index({ userId: 1, archived: 1 });

const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;

