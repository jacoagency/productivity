import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(
  request: Request,
  { params }: { params: { categoryId: string } }
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
    
    await db.collection('categories').updateOne(
      { _id: new ObjectId(params.categoryId), userId },
      { 
        $set: {
          label,
          color,
          updatedAt: new Date()
        }
      }
    );

    // También actualizar todas las tareas y eventos que usan esta categoría
    await db.collection('tasks').updateMany(
      { userId, category: params.categoryId },
      { $set: { categoryLabel: label, categoryColor: color } }
    );

    await db.collection('events').updateMany(
      { userId, category: params.categoryId },
      { $set: { categoryLabel: label, categoryColor: color } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('productivity');
    
    // Eliminar la categoría
    await db.collection('categories').deleteOne({
      _id: new ObjectId(params.categoryId),
      userId
    });

    // Actualizar tareas y eventos que usaban esta categoría
    await db.collection('tasks').updateMany(
      { userId, category: params.categoryId },
      { $unset: { category: "", categoryLabel: "", categoryColor: "" } }
    );

    await db.collection('events').updateMany(
      { userId, category: params.categoryId },
      { $unset: { category: "", categoryLabel: "", categoryColor: "" } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
} 