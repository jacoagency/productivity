import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';
import { format } from 'date-fns';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('productivity');
    
    // Only get events that have a unique taskId (if they have one)
    const events = await db
      .collection('events')
      .aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: { $ifNull: ['$taskId', '$_id'] },
            doc: { $first: '$$ROOT' }
          }
        },
        { $replaceRoot: { newRoot: '$doc' } },
        { $sort: { start: 1 } }
      ])
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
    const { title, start, end, desc, category, importance, allDay } = body;

    const client = await clientPromise;
    const db = client.db('productivity');
    
    // Create the event first
    const event = {
      userId,
      title,
      start: new Date(start),
      end: new Date(end),
      desc,
      category,
      importance,
      allDay,
      createdAt: new Date()
    };

    const result = await db.collection('events').insertOne(event);
    return NextResponse.json({ ...event, _id: result.insertedId });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
} 