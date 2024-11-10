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
    const defaultTasks = await db
      .collection('defaultTasks')
      .find({ userId })
      .toArray();

    return NextResponse.json(defaultTasks);
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
    const { title, category, estimatedTime } = body;

    const client = await clientPromise;
    const db = client.db('productivity');
    
    const defaultTask = {
      userId,
      title,
      category,
      estimatedTime,
      createdAt: new Date()
    };

    const result = await db.collection('defaultTasks').insertOne(defaultTask);
    return NextResponse.json({ ...defaultTask, _id: result.insertedId });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
} 