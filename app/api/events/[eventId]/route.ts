import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('productivity');
    
    // Obtener el evento para ver si está asociado a una tarea
    const event = await db.collection('events').findOne({
      _id: new ObjectId(params.eventId),
      userId
    });

    // Eliminar el evento
    await db.collection('events').deleteOne({
      _id: new ObjectId(params.eventId),
      userId
    });

    // Si el evento estaba asociado a una tarea, eliminar la tarea también
    if (event && event.taskId) {
      await db.collection('tasks').deleteOne({
        _id: new ObjectId(event.taskId),
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
  { params }: { params: { eventId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { title, start, end, category, importance } = body;

    const client = await clientPromise;
    const db = client.db('productivity');

    // Obtener el evento para ver si está asociado a una tarea
    const event = await db.collection('events').findOne({
      _id: new ObjectId(params.eventId),
      userId
    });
    
    // Actualizar el evento
    await db.collection('events').updateOne(
      { _id: new ObjectId(params.eventId), userId },
      { 
        $set: {
          title,
          start: new Date(start),
          end: new Date(end),
          category,
          importance,
          updatedAt: new Date()
        }
      }
    );

    // Si el evento está asociado a una tarea, actualizar la tarea también
    if (event && event.taskId) {
      await db.collection('tasks').updateOne(
        { _id: new ObjectId(event.taskId), userId },
        {
          $set: {
            title,
            dueDate: new Date(start),
            category,
            importance,
            updatedAt: new Date()
          }
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
} 