import mongoose, { Schema, Model } from 'mongoose';
import { IPrompt } from '@/types';

const PromptSchema = new Schema<IPrompt>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    category: {
      type: String,
      default: '',
    },
    tags: [{
      type: String,
    }],
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
PromptSchema.index({ userId: 1, isFavorite: 1 });
PromptSchema.index({ userId: 1, tags: 1 });

const Prompt: Model<IPrompt> =
  mongoose.models.Prompt || mongoose.model<IPrompt>('Prompt', PromptSchema);

export default Prompt;
