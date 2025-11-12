import mongoose, { Schema, Model } from 'mongoose';
import { IKanbanColumn } from '@/types';

const KanbanColumnSchema = new Schema<IKanbanColumn>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Column name is required'],
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    color: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
KanbanColumnSchema.index({ projectId: 1, order: 1 });

const KanbanColumn: Model<IKanbanColumn> = 
  mongoose.models.KanbanColumn || mongoose.model<IKanbanColumn>('KanbanColumn', KanbanColumnSchema);

export default KanbanColumn;

