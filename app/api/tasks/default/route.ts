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
    const today = format(new Date(), 'yyyy-MM-dd');

    const tasks = await db
      .collection('tasks')
      .find({ 
        userId,
        folderDate: today,
        folder: 'day'
      })
      .toArray();

    return NextResponse.json(tasks);
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
} 