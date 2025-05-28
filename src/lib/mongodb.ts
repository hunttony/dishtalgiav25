import { MongoClient, MongoClientOptions, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI as string;
const MONGODB_DB = process.env.MONGODB_DB as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
}

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
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      retryWrites: true,
      w: 'majority',
      retryReads: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      ssl: true,
      authMechanism: 'DEFAULT',
      authSource: 'admin',
      maxPoolSize: 10,
      minPoolSize: 1
    };

    cached.promise = MongoClient.connect(MONGODB_URI, opts).then((client) => {
      return {
        client,
        db: client.db(MONGODB_DB),
      };
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
