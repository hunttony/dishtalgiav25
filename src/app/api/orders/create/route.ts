import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';
import { clientPromise } from '@/lib/mongodb';
import { Order } from '@/models/Order';

function generateOrderNumber() {
  const date = new Date();
  const random = Math.floor(Math.random() * 10000);
  return `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${random}`;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { items, paymentId } = await request.json();
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in order' },
        { status: 400 }
      );
    }

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const orderData: Omit<Order, '_id'> = {
      orderNumber: generateOrderNumber(),
      userEmail: session.user.email,
      items: items.map(item => ({
        _id: new ObjectId().toString(),
        productId: item.productId,
        productName: item.productName,
        name: item.productName, // Required by OrderItem interface
        sizeId: item.sizeId,
        sizeName: item.sizeName,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      subtotal,
      tax,
      total,
      paymentStatus: 'completed',
      paymentMethod: 'paypal',
      paymentId,
      status: 'processing',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<Order>('orders').insertOne(orderData);

    // Clear the cart
    await db.collection('carts').updateOne(
      { userEmail: session.user.email },
      { $set: { items: [] } },
      { upsert: true }
    );

    // TODO: Send order confirmation email

    return NextResponse.json({ 
      success: true, 
      orderId: result.insertedId,
      orderNumber: orderData.orderNumber
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
