import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { defaultTaskId, date, completed } = body;

    const client = await clientPromise;
    const db = client.db('productivity');

    // Actualizar o crear el estado de la tarea por defecto
    await db.collection('defaultTasksStatus').updateOne(
      { 
        userId,
        defaultTaskId,
        date
      },
      { 
        $set: { 
          completed,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
} 