'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Task {
  _id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  date: string;
  folderId?: string;
  priority: 'low' | 'medium' | 'high';
}

// Función auxiliar para formatear fechas de manera segura
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return format(date, 'MMM d, HH:mm');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

export default function DashboardPage() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Función para obtener todas las tareas
  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const tasks = await response.json();
      setAllTasks(tasks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  // Actualizar tareas cada 2 segundos
  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Task Dashboard</h1>
        <Link 
          href="/tasks" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Manage Tasks
        </Link>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Total Tasks</h3>
            <Clock className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold mt-2">{allTasks.length}</p>
          <p className="text-sm text-gray-500 mt-1">All time tasks</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Completed</h3>
            <CheckCircle className="text-green-500" />
          </div>
          <p className="text-3xl font-bold mt-2">{allTasks.filter(task => task.completed).length}</p>
          <p className="text-sm text-gray-500 mt-1">Tasks completed</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Pending</h3>
            <AlertCircle className="text-yellow-500" />
          </div>
          <p className="text-3xl font-bold mt-2">{allTasks.filter(task => !task.completed).length}</p>
          <p className="text-sm text-gray-500 mt-1">Tasks to do</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Overall Progress</h3>
          <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${allTasks.length > 0 ? (allTasks.filter(task => task.completed).length / allTasks.length) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-3xl font-bold mt-2">
              {allTasks.length > 0 ? ((allTasks.filter(task => task.completed).length / allTasks.length) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Pending Tasks</h3>
            <Link href="/tasks?filter=pending" className="text-blue-500 hover:text-blue-600">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {allTasks.filter(task => !task.completed).slice(0, 5).map((task) => (
              <div
                key={task._id}
                onClick={() => router.push(`/tasks?selected=${task._id}`)}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <div>
                  <span className="font-medium">{task.title}</span>
                  <span className={`ml-2 text-xs px-2 py-1 rounded ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(task.date)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recently Completed</h3>
            <Link href="/tasks?filter=completed" className="text-blue-500 hover:text-blue-600">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {allTasks.filter(task => task.completed)
              .sort((a, b) => {
                if (!a.completedAt || !b.completedAt) return 0;
                return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
              })
              .slice(0, 5)
              .map((task) => (
                <div
                  key={task._id}
                  onClick={() => router.push(`/tasks?selected=${task._id}`)}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  <span className="font-medium">{task.title}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {task.completedAt ? formatDate(task.completedAt) : 'No completion date'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
} 