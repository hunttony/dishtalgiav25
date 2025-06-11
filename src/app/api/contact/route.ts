import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ContactCollection, ContactFormData } from '@/models/Contact';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

// Helper function to validate email
function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Helper function to create consistent responses
function createResponse(
  data: Record<string, any>,
  status: number = 200,
  headers: Record<string, string> = {}
) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      ...headers,
    },
  });
}

// Handle CORS preflight
// This is important for frontend to work properly
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return createResponse(
        { error: 'Invalid JSON in request body' },
        400
      );
    }

    const { name, email, subject, message } = body;

    // Input validation
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return createResponse(
        { error: 'All fields are required' },
        400
      );
    }

    if (!isValidEmail(email)) {
      return createResponse(
        { error: 'Please enter a valid email address' },
        400
      );
    }

    // Prepare contact data
    const now = new Date();
    const contactData: ContactFormData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      createdAt: now,
      updatedAt: now,
      status: 'new',
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      metadata: {
        userAgent: request.headers.get('user-agent') || undefined,
        referrer: request.headers.get('referer') || undefined,
      },
    };

    // Save to database
    try {
      const { db } = await connectToDatabase();
      const result = await db.collection(ContactCollection).insertOne(contactData);
      
      return createResponse({
        success: true,
        id: result.insertedId,
        message: 'Your message has been sent successfully!'
      }, 201);
      
    } catch (dbError) {
      console.error('Database error:', dbError);
      return createResponse(
        { error: 'Failed to save your message. Please try again later.' },
        500
      );
    }
    
  } catch (error) {
    console.error('Error in contact API:', error);
    return createResponse(
      { error: 'An unexpected error occurred. Please try again later.' },
      500
    );
  }
}
