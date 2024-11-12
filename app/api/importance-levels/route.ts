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
    const levels = await db
      .collection('importance-levels')
      .find({ userId })
      .toArray();

    return NextResponse.json(levels);
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
    
    const level = {
      userId,
      label,
      color,
      createdAt: new Date()
    };

    const result = await db.collection('importance-levels').insertOne(level);
    return NextResponse.json({ ...level, _id: result.insertedId });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
} 