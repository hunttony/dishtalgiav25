import { NextResponse } from 'next/server';
import { checkMongoDBConnection } from '@/lib/mongodb';

export async function GET() {
  try {
    const isConnected = await checkMongoDBConnection();
    
    if (isConnected) {
      return NextResponse.json({
        status: 'ok',
        message: 'MongoDB connection successful',
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'MongoDB connection failed',
        details: { connected: false },
      }, { status: 500 });
    }
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({
      status: 'error',
      message: 'Error checking MongoDB connection',
      error: error.message,
    }, { status: 500 });
  }
}