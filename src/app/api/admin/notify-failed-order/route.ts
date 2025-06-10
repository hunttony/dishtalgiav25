import { NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    // In a production environment, you'd want to verify admin privileges here
    // For now, we'll just log the failed order notification
    
    const { paypalOrderId, error, timestamp } = await request.json();
    
    if (!paypalOrderId) {
      return NextResponse.json(
        { error: 'Missing required field: paypalOrderId' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Log the failed order for admin review
    await db.collection('failed_order_attempts').insertOne({
      paypalOrderId,
      error: error || 'Unknown error',
      timestamp: timestamp || new Date(),
      status: 'unresolved',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // In a production environment, you might want to send an email or notification here
    console.error('Failed order attempt:', { paypalOrderId, error, timestamp });

    return NextResponse.json({ 
      success: true,
      message: 'Failed order logged for admin review'
    });
  } catch (error) {
    console.error('Error logging failed order:', error);
    return NextResponse.json(
      { 
        error: 'Failed to log failed order',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
