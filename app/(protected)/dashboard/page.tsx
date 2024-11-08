import DashboardStats from "../../components/DashboardStats"
import DashboardChart from "../../components/DashboardChart"
import Link from 'next/link'

export default function Dashboard() {
  return (
    <main className="container mx-auto p-6 sm:p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardStats />
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
            Productivity Overview
          </h2>
          <DashboardChart />
        </div>
        
        <div className="md:col-span-3 flex gap-4 mt-4">
          <Link 
            href="/tasks" 
            className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Tasks
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your daily tasks and track progress
            </p>
          </Link>
          
          <Link 
            href="/calendar" 
            className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Calendar
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              View and plan your schedule
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
} 