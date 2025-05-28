import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('Testing database connection...');
    const db = await getDb();
    
    // Test the connection by listing collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('Connected to MongoDB. Collections:', collectionNames);
    
    // Check if orders collection exists
    const hasOrdersCollection = collectionNames.includes('orders');
    
    return NextResponse.json({
      success: true,
      database: process.env.MONGODB_DB,
      collections: collectionNames,
      hasOrdersCollection,
      ordersCollectionSize: hasOrdersCollection 
        ? await db.collection('orders').countDocuments() 
        : 'N/A'
    });
    
  } catch (error) {
    const err = error as Error;
    console.error('Database test failed:', err);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to connect to database',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      },
      { status: 500 }
    );
  }
}
