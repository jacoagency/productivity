'use client';

import Link from 'next/link';
import { UserButton } from "@clerk/nextjs";
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'bg-purple-50 dark:bg-gray-800' : '';
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-gray-800 dark:text-white">
              Productivity
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className={`px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-800 ${isActive('/dashboard')}`}
              >
                Dashboard
              </Link>
              <Link 
                href="/tasks" 
                className={`px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-800 ${isActive('/tasks')}`}
              >
                Tasks
              </Link>
              <Link 
                href="/calendar" 
                className={`px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-800 ${isActive('/calendar')}`}
              >
                Calendar
              </Link>
            </div>
          </div>
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-10 h-10",
              }
            }}
          />
        </div>
      </div>
    </nav>
  );
} 