import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';
import { format } from 'date-fns';

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
      .sort({ folderDate: -1, createdAt: -1 })
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
    const { title, dueDate, category, importance, folder = 'day' } = body;

    const client = await clientPromise;
    const db = client.db('productivity');
    
    const task = {
      userId,
      title,
      completed: false,
      dueDate: dueDate ? new Date(dueDate) : null,
      category,
      importance,
      folder,
      createdAt: new Date()
    };

    const taskResult = await db.collection('tasks').insertOne(task);

    const event = {
      userId,
      title,
      start: new Date(dueDate),
      end: new Date(new Date(dueDate).setHours(new Date(dueDate).getHours() + 1)),
      category,
      importance,
      isTaskEvent: true,
      taskId: taskResult.insertedId.toString(),
      createdAt: new Date()
    };

    await db.collection('events').insertOne(event);

    return NextResponse.json({ ...task, _id: taskResult.insertedId });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
} 