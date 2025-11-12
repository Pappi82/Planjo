import mongoose, { Schema, Model } from 'mongoose';
import { ICredential } from '@/types';

const CredentialSchema = new Schema<ICredential>(
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
    category: {
      type: String,
      enum: ['api-key', 'password', 'database-url', 'env-var', 'other'],
      required: true,
    },
    label: {
      type: String,
      required: [true, 'Credential label is required'],
      trim: true,
    },
    encryptedValue: {
      type: String,
      required: [true, 'Encrypted value is required'],
    },
    url: {
      type: String,
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
CredentialSchema.index({ projectId: 1, userId: 1 });

const Credential: Model<ICredential> = 
  mongoose.models.Credential || mongoose.model<ICredential>('Credential', CredentialSchema);

export default Credential;

