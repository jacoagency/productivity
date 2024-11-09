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