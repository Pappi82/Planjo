import mongoose, { Schema, Model } from 'mongoose';
import { IDocument } from '@/types';

const DocumentSchema = new Schema<IDocument>(
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
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries and full-text search
DocumentSchema.index({ projectId: 1, userId: 1 });
DocumentSchema.index({ title: 'text', content: 'text' });

const DocumentModel: Model<IDocument> = 
  mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);

export default DocumentModel;

