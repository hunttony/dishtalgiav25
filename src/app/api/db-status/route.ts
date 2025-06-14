import { NextResponse } from 'next/server';
import { checkMongoDBConnection } from '@/lib/mongodb';

export async function GET() {
  try {
    const connectionStatus = await checkMongoDBConnection();
    
    if (connectionStatus.success) {
      return NextResponse.json({
        status: 'ok',
        message: 'MongoDB connection successful',
        details: connectionStatus,
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'MongoDB connection failed',
        details: connectionStatus,
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