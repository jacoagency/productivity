import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';
import { format } from 'date-fns';
import { DEFAULT_DAILY_TASKS } from '@/models/DefaultTask';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('productivity');
    const today = format(new Date(), 'yyyy-MM-dd');

    // Obtener las tareas existentes para hoy
    const existingTasks = await db
      .collection('tasks')
      .find({ 
        userId,
        folderDate: today,
        folder: 'day'
      })
      .toArray();

    // Combinar con las tareas por defecto
    const defaultTasks = DEFAULT_DAILY_TASKS.map(task => ({
      ...task,
      completed: false, // Asegurarnos que estén desmarcadas
      dueDate: new Date(),
      folder: 'day',
      folderDate: today,
      userId
    }));

    // Devolver todas las tareas
    return NextResponse.json([...existingTasks, ...defaultTasks]);
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
} 