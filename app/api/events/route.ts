import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('productivity');
    const events = await db
      .collection('events')
      .find({ userId })
      .sort({ start: 1 })
      .toArray();

    return NextResponse.json(events);
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
    const { title, start, end, desc, allDay } = body;

    const client = await clientPromise;
    const db = client.db('productivity');

    // Verificar si hay eventos que se solapan
    const overlappingEvents = await db.collection('events').find({
      userId,
      $or: [
        {
          start: {
            $lt: new Date(end),
            $gte: new Date(start)
          }
        },
        {
          end: {
            $gt: new Date(start),
            $lte: new Date(end)
          }
        }
      ]
    }).toArray();

    if (overlappingEvents.length > 0) {
      return new NextResponse('There is already an event scheduled for this time', { status: 409 });
    }
    
    const event = {
      userId,
      title,
      start: new Date(start),
      end: new Date(end),
      desc,
      allDay,
      createdAt: new Date()
    };

    const result = await db.collection('events').insertOne(event);
    return NextResponse.json({ ...event, _id: result.insertedId });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
} 