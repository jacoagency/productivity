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
    
    await db.collection('events').deleteOne({
      _id: new ObjectId(params.eventId),
      userId
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: { eventId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const eventId = context.params.eventId;
    if (!eventId) {
      return new NextResponse('Event ID is required', { status: 400 });
    }

    const body = await request.json();
    const { color } = body;

    const client = await clientPromise;
    const db = client.db('productivity');
    
    const result = await db.collection('events').updateOne(
      { 
        _id: new ObjectId(eventId),
        userId 
      },
      { 
        $set: {
          color,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return new NextResponse('Event not found', { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating event:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 