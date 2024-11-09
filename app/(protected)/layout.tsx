import Navigation from '../components/Navigation';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { EventProvider } from '../contexts/EventContext';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <EventProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        {children}
      </div>
    </EventProvider>
  );
} 