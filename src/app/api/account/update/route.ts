import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDb } from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse the request body
    const userData = await req.json();
    
    // Extract address if it exists
    const { address, ...userUpdate } = userData;
    
    // Connect to the database
    const db = await getDb();
    
    // Prepare the update object
    const updateData: any = { ...userUpdate };
    
    // If address is provided, add it to the update
    if (address) {
      updateData.address = address;
      
      // Set default country if not provided
      if (address.country === undefined) {
        updateData.address.country = 'United States';
      }
    }
    
    // Update the user in the database
    const result = await db.collection('users').updateOne(
      { email: session.user.email },
      { $set: updateData },
      { upsert: true }
    );
    
    if (!result.matchedCount && !result.upsertedCount) {
      throw new Error('Failed to update user');
    }
    
    // Return the updated user data
    const updatedUser = await db.collection('users').findOne({
      email: session.user.email,
    });
    
    // Remove sensitive data before sending the response
    if (updatedUser) {
      const { password, ...userWithoutPassword } = updatedUser;
      return NextResponse.json(userWithoutPassword);
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
