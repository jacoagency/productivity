import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { TaskList } from '../components/TaskList';

export default async function Tasks() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
          Task Management
        </h1>
        <TaskList />
      </main>
    </div>
  );
} 