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
    mood: {
      type: String,
      enum: ['great', 'good', 'okay', 'struggling'],
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    wins: {
      type: [String],
      default: [],
    },
    challenges: {
      type: [String],
      default: [],
    },
    learnings: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Unique index to ensure one entry per user per day
JournalEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

const JournalEntry: Model<IJournalEntry> = 
  mongoose.models.JournalEntry || mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema);

export default JournalEntry;

