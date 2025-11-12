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
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
DocumentSchema.index({ projectId: 1, pinned: -1 });
DocumentSchema.index({ title: 'text', content: 'text' }); // Full-text search

const DocumentModel: Model<IDocument> = 
  mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);

export default DocumentModel;

