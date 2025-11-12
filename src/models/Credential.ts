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
    name: {
      type: String,
      required: [true, 'Credential name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['api-key', 'password', 'database-url', 'env-var', 'other'],
      default: 'other',
    },
    encryptedValue: {
      type: String,
      required: [true, 'Encrypted value is required'],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
CredentialSchema.index({ projectId: 1 });

const Credential: Model<ICredential> = 
  mongoose.models.Credential || mongoose.model<ICredential>('Credential', CredentialSchema);

export default Credential;

