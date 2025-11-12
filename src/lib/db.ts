import mongoose from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  console.log('[dbConnect] Attempting to connect to MongoDB');

  if (cached.conn) {
    console.log('[dbConnect] Using cached connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      console.error('[dbConnect] MONGODB_URI is not defined');
      throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    }

    console.log('[dbConnect] Creating new connection promise');
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ [dbConnect] MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      console.error('❌ [dbConnect] MongoDB connection failed:', error);
      throw error;
    });
  }

  try {
    console.log('[dbConnect] Awaiting connection promise');
    cached.conn = await cached.promise;
    console.log('[dbConnect] Connection established');
  } catch (e) {
    console.error('[dbConnect] Error awaiting connection:', e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;

