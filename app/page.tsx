import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { userId } = await auth();
  
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-6 py-16 sm:py-24">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Organize Your Day
            <span className="text-purple-600 dark:text-purple-400"> Effortlessly</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Track tasks, manage your time, and boost your productivity with our intuitive dashboard.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/sign-up"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/sign-in"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
