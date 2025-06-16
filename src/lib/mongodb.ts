import { MongoClient, MongoClientOptions, Db } from 'mongodb';
import { env } from './env';

// These will be validated by env.ts, but we need to ensure type safety
const MONGODB_URI = env.MONGODB_URI as string;
const MONGODB_DB = env.MONGODB_DB as string;

interface CachedConnection {
  client: MongoClient;
  db: Db;
}

declare global {
  // eslint-disable-next-line no-var
  var mongo: {
    conn: CachedConnection | null;
    promise: Promise<CachedConnection> | null;
  };
}

const cached = global.mongo || { conn: null, promise: null };

if (!global.mongo) {
  global.mongo = cached;
}

export async function connectToDatabase(): Promise<CachedConnection> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: MongoClientOptions = {
      // TLS/SSL Configuration - only enable if your MongoDB URI uses 'mongodb+srv://'
      tls: MONGODB_URI.startsWith('mongodb+srv://'),
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      
      // Connection Timeouts - increased for better reliability
      connectTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000,  // 45 seconds
      serverSelectionTimeoutMS: 30000, // 30 seconds
      heartbeatFrequencyMS: 10000,
      
      // Authentication
      authMechanism: 'DEFAULT',
      authSource: 'admin',
      
      // Connection Pooling - optimized for serverless environments
      maxPoolSize: 15,
      minPoolSize: 1,
      maxIdleTimeMS: 10000,
      waitQueueTimeoutMS: 10000,
      
      // Retry Logic - more aggressive retry settings
      retryWrites: true,
      retryReads: true,
      
      // Read/Write Concerns
      w: 'majority',
      wtimeoutMS: 10000,
      readPreference: 'primaryPreferred',
      
      // Compression - disable if not needed
      compressors: ['zlib'],
      zlibCompressionLevel: 3 // Lower compression for better performance
    };

    console.log('Attempting to connect to MongoDB...');
    
    cached.promise = MongoClient.connect(MONGODB_URI, opts)
      .then((client) => {
        console.log('Successfully connected to MongoDB');
        return {
          client,
          db: client.db(MONGODB_DB),
        };
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        throw new Error(`Failed to connect to MongoDB: ${error.message}`);
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Export the client promise for NextAuth.js
export const clientPromise = (async () => {
  const { client } = await connectToDatabase();
  return client;
})();

// Export the database for direct use
export const getDb = async () => {
  const { db } = await connectToDatabase();
  return db;
};

/**
 * Checks if the MongoDB connection is active
 * @returns Promise<boolean> True if connection is successful, false otherwise
 */
export async function checkMongoDBConnection(): Promise<boolean> {
  try {
    const { client } = await connectToDatabase();
    await client.db().admin().ping();
    return true;
  } catch (error) {
    console.error('MongoDB connection check failed:', error);
    return false;
  }
};
