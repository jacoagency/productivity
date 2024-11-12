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
    
    // Eliminar la tarea
    await db.collection('tasks').deleteOne({
      _id: new ObjectId(params.taskId),
      userId
    });

    // Eliminar el evento asociado
    await db.collection('events').deleteOne({
      taskId: params.taskId,
      userId
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
} 