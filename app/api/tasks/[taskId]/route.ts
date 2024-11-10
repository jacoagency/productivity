import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const taskId = params.taskId;
    const body = await request.json();
    const { completed } = body;

    const client = await clientPromise;
    const db = client.db('productivity');
    
    const result = await db.collection('tasks').updateOne(
      { _id: new ObjectId(taskId), userId },
      { 
        $set: { 
          completed,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return new NextResponse('Task not found', { status: 404 });
    }

    // Devolver la tarea actualizada
    const updatedTask = await db.collection('tasks').findOne({ _id: new ObjectId(taskId) });
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const taskId = params.taskId;
    const client = await clientPromise;
    const db = client.db('productivity');
    
    const result = await db.collection('tasks').deleteOne({
      _id: new ObjectId(taskId),
      userId
    });

    if (result.deletedCount === 0) {
      return new NextResponse('Task not found', { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 