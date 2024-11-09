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
    const tasks = await db
      .collection('tasks')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(tasks);
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
    const { title, dueDate } = body;

    const client = await clientPromise;
    const db = client.db('productivity');
    
    const task = {
      userId,
      title,
      completed: false,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdAt: new Date()
    };

    const result = await db.collection('tasks').insertOne(task);
    return NextResponse.json({ ...task, _id: result.insertedId });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
} 