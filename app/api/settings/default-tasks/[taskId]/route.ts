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

    const taskId = params.taskId;
    const client = await clientPromise;
    const db = client.db('productivity');
    
    const result = await db.collection('defaultTasks').deleteOne({
      _id: new ObjectId(taskId),
      userId
    });

    if (result.deletedCount === 0) {
      return new NextResponse('Task not found', { status: 404 });
    }

    await db.collection('defaultTasksStatus').deleteMany({
      userId,
      defaultTaskId: taskId
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
} 