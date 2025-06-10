import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';
import { clientPromise } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { orderId, paymentDetails, paymentStatus } = await request.json();
    
    if (!orderId || !paymentDetails) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId and paymentDetails are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Update the order with payment details
    const result = await db.collection('orders').updateOne(
      { 
        _id: new ObjectId(orderId),
        userEmail: session.user.email 
      },
      {
        $set: {
          paymentDetails,
          paymentStatus: paymentStatus || 'completed',
          status: 'processing',
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Order not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      updated: result.modifiedCount > 0
    });
  } catch (error) {
    console.error('Error updating order payment:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update order payment',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
