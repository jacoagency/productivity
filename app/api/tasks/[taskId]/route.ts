import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('productivity');
    
    // First get the task
    const task = await db.collection('tasks').findOne({
      _id: new ObjectId(params.taskId),
      userId
    });

    // Delete the task
    await db.collection('tasks').deleteOne({
      _id: new ObjectId(params.taskId),
      userId
    });

    // Delete any associated event (check both eventId and taskId references)
    if (task) {
      await db.collection('events').deleteOne({
        $or: [
          { _id: task.eventId ? new ObjectId(task.eventId) : null },
          { taskId: params.taskId }
        ],
        userId
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { completed } = body;

    const client = await clientPromise;
    const db = client.db('productivity');
    
    await db.collection('tasks').updateOne(
      { _id: new ObjectId(params.taskId), userId },
      { 
        $set: {
          completed,
          completedAt: completed ? new Date() : null,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
} 