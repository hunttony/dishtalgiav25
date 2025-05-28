import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ContactCollection, ContactFormData } from '@/models/Contact';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Basic validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const now = new Date();

    const contactData: ContactFormData = {
      name,
      email,
      subject,
      message,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection(ContactCollection).insertOne(contactData);

    return NextResponse.json({
      success: true,
      id: result.insertedId,
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json(
      { error: 'Error submitting form' },
      { status: 500 }
    );
  }
}
