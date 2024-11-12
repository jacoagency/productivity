import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(
  request: Request,
  { params }: { params: { levelId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { label, color } = body;

    const client = await clientPromise;
    const db = client.db('productivity');
    
    await db.collection('importance-levels').updateOne(
      { _id: new ObjectId(params.levelId), userId },
      { 
        $set: {
          label,
          color,
          updatedAt: new Date()
        }
      }
    );

    // También actualizar todas las tareas y eventos que usan este nivel
    await db.collection('tasks').updateMany(
      { userId, importance: params.levelId },
      { $set: { importanceLabel: label, importanceColor: color } }
    );

    await db.collection('events').updateMany(
      { userId, importance: params.levelId },
      { $set: { importanceLabel: label, importanceColor: color } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { levelId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('productivity');
    
    // Eliminar el nivel
    await db.collection('importance-levels').deleteOne({
      _id: new ObjectId(params.levelId),
      userId
    });

    // Actualizar tareas y eventos que usaban este nivel
    await db.collection('tasks').updateMany(
      { userId, importance: params.levelId },
      { $unset: { importance: "", importanceLabel: "", importanceColor: "" } }
    );

    await db.collection('events').updateMany(
      { userId, importance: params.levelId },
      { $unset: { importance: "", importanceLabel: "", importanceColor: "" } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
} 