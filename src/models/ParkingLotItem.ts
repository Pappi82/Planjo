import mongoose, { Schema, Model } from 'mongoose';
import { IParkingLotItem } from '@/types';

const ParkingLotItemSchema = new Schema<IParkingLotItem>(
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
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    convertedToTaskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ParkingLotItemSchema.index({ userId: 1, convertedToTaskId: 1 });

const ParkingLotItem: Model<IParkingLotItem> = 
  mongoose.models.ParkingLotItem || mongoose.model<IParkingLotItem>('ParkingLotItem', ParkingLotItemSchema);

export default ParkingLotItem;

