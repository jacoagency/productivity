'use client';

import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/dashboard" className="text-xl font-bold text-gray-800 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
      Productivity
    </Link>
  );
} 