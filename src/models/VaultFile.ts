import mongoose, { Schema, Model } from 'mongoose';
import { IVaultFile } from '@/types';

const VaultFileSchema = new Schema<IVaultFile>(
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
    filename: {
      type: String,
      required: [true, 'Filename is required'],
      trim: true,
    },
    encryptedContent: {
      type: String,
      required: [true, 'Encrypted content is required'],
    },
    mimeType: {
      type: String,
    },
    size: {
      type: Number,
      required: [true, 'File size is required'],
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
VaultFileSchema.index({ projectId: 1, userId: 1 });

const VaultFile: Model<IVaultFile> =
  mongoose.models.VaultFile || mongoose.model<IVaultFile>('VaultFile', VaultFileSchema);

export default VaultFile;
