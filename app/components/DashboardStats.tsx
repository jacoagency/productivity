'use client';

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Tasks Completed
        </h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
          24/30
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '80%' }}></div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Productivity Score
        </h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
          85%
        </p>
        <p className="text-sm text-green-500 mt-1">
          ↑ 12% from last week
        </p>
      </div>
    </div>
  );
} 