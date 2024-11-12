import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('productivity');
    const categories = await db
      .collection('categories')
      .find({ userId })
      .toArray();

    return NextResponse.json(categories);
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { label, color } = body;

    const client = await clientPromise;
    const db = client.db('productivity');
    
    const category = {
      userId,
      label,
      color,
      createdAt: new Date()
    };

    const result = await db.collection('categories').insertOne(category);
    return NextResponse.json({ ...category, _id: result.insertedId });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
} 