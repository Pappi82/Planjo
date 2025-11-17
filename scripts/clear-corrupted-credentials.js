/**
 * Script to clear corrupted credentials from the database
 * Run with: node scripts/clear-corrupted-credentials.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

// Define Credential schema
const credentialSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  category: {
    type: String,
    enum: ['files', 'api-key', 'password', 'database-url', 'env-var', 'other'],
    required: true,
  },
  label: { type: String, required: true },
  encryptedValue: { type: String, required: true },
  url: String,
  notes: String,
  filename: String,
  mimeType: String,
  size: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Credential = mongoose.models.Credential || mongoose.model('Credential', credentialSchema);

async function clearCorruptedCredentials() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n📊 Fetching all credentials...');
    const credentials = await Credential.find({});
    console.log(`Found ${credentials.length} credentials in database`);

    if (credentials.length === 0) {
      console.log('✅ No credentials found. Database is clean!');
      await mongoose.disconnect();
      return;
    }

    console.log('\n🗑️  Deleting all credentials...');
    const result = await Credential.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} credentials`);

    console.log('\n✨ Database cleaned successfully!');
    console.log('You can now upload new files without decryption errors.');

    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearCorruptedCredentials();

