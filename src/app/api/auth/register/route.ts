import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { hash } from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received registration data:', body);
    
    // Validate request body
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Validate data against schema
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;
    const { db } = await connectToDatabase();
    
    // Check for existing user
    const existingUser = await db.collection('users').findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 10);

    // Create new user
    const result = await db.collection('users').insertOne({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      emailVerified: false,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!result.acknowledged) {
      throw new Error('Failed to create user');
    }

    return NextResponse.json(
      { 
        message: 'User created successfully',
        userId: result.insertedId 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
