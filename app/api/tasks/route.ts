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
    const { title, dueDate, category, importance, folder = 'day', eventId } = body;

    const client = await clientPromise;
    const db = client.db('productivity');

    // Check for overlapping tasks
    const startTime = new Date(dueDate);
    const endTime = new Date(new Date(dueDate).setHours(startTime.getHours() + 1));

    const overlappingTasks = await db.collection('tasks').find({
      userId,
      dueDate: {
        $gte: startTime,
        $lt: endTime
      }
    }).toArray();

    if (overlappingTasks.length > 0) {
      return new NextResponse(
        JSON.stringify({ error: 'This time slot overlaps with another task' }), 
        { status: 409 }
      );
    }
    
    const task = {
      userId,
      title,
      completed: false,
      dueDate: dueDate ? new Date(dueDate) : null,
      category,
      importance,
      folder,
      eventId,
      createdAt: new Date()
    };

    const taskResult = await db.collection('tasks').insertOne(task);

    // Create event only if no eventId was provided and there's a dueDate
    if (!eventId && dueDate) {
      const event = {
        userId,
        title,
        start: new Date(dueDate),
        end: endTime,
        category,
        importance,
        isTaskEvent: true,
        taskId: taskResult.insertedId.toString(),
        createdAt: new Date()
      };

      await db.collection('events').insertOne(event);
    }

    return NextResponse.json({ ...task, _id: taskResult.insertedId });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
} 