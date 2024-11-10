import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';
import { format, subMonths } from 'date-fns';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('productivity');
    
    // Obtener fecha de hace 12 meses
    const twelveMonthsAgo = subMonths(new Date(), 12);
    const yearFolder = format(twelveMonthsAgo, 'yyyy');

    // Mover tareas antiguas a carpeta de año
    await db.collection('tasks').updateMany(
      {
        userId,
        folder: 'month',
        folderDate: { $lt: format(twelveMonthsAgo, 'yyyy-MM') }
      },
      {
        $set: {
          folder: 'year',
          folderDate: yearFolder
        }
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
} 