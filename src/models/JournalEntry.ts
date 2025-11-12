import mongoose, { Schema, Model } from 'mongoose';
import { IJournalEntry } from '@/types';

const JournalEntrySchema = new Schema<IJournalEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
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
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
JournalEntrySchema.index({ userId: 1, date: -1 });

const JournalEntry: Model<IJournalEntry> = 
  mongoose.models.JournalEntry || mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema);

export default JournalEntry;

