import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    // Get pagination parameters from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.error('Unauthorized access attempt to orders API');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.log(`Fetching orders for user: ${session.user.email}`);
    
    try {
      const db = await getDb();
      
      // Get total count for pagination
      const total = await db.collection('orders')
        .countDocuments({ userEmail: session.user.email });
      
      // Get paginated orders
      const orders = await db.collection('orders')
        .find({ userEmail: session.user.email })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      console.log(`Found ${orders.length} orders out of ${total}`);
      
      return NextResponse.json({
        data: orders,
        pagination: {
          total,
          page,
          totalPages: Math.ceil(total / limit),
          limit
        }
      });
      
    } catch (error) {
      const dbError = error as Error;
      console.error('Database error:', dbError);
      return NextResponse.json(
        { 
          error: 'Database error',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const err = error as Error;
    console.error('Unexpected error in orders API:', err);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      },
      { status: 500 }
    );
  }
}
