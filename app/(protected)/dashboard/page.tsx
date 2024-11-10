'use client';

import { useState, useEffect } from 'react';
import { ResponsiveLine } from '@nivo/line';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Calcular estadísticas generales
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(task => task.completed);
  const pendingTasks = allTasks.filter(task => !task.completed);
  const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

  // Calcular estadísticas de hoy de manera segura
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTasks = allTasks.filter(task => {
    try {
      const taskDate = new Date(task.date);
      if (isNaN(taskDate.getTime())) return false;
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    } catch (error) {
      return false;
    }
  });

  const todayCompleted = todayTasks.filter(task => task.completed);
  const todayPending = todayTasks.filter(task => !task.completed);

  // Preparar datos para el gráfico de manera segura
  const last24Hours = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date();
    hour.setHours(hour.getHours() - (23 - i), 0, 0, 0);
    
    const tasksInHour = completedTasks.filter(task => {
      if (!task.completedAt) return false;
      try {
        const completedHour = new Date(task.completedAt);
        if (isNaN(completedHour.getTime())) return false;
        return completedHour >= hour && completedHour < new Date(hour.getTime() + 3600000);
      } catch (error) {
        return false;
      }
    });

    return {
      x: format(hour, 'HH:mm'),
      y: tasksInHour.length
    };
  });

  const chartData = [
    {
      id: 'Completed Tasks',
      data: last24Hours
    }
  ];

  return (
    <main className="container mx-auto p-6 space-y-6">
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
          <p className="text-3xl font-bold mt-2">{totalTasks}</p>
          <p className="text-sm text-gray-500 mt-1">All time tasks</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Completed</h3>
            <CheckCircle className="text-green-500" />
          </div>
          <p className="text-3xl font-bold mt-2">{completedTasks.length}</p>
          <p className="text-sm text-gray-500 mt-1">Tasks completed</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Pending</h3>
            <AlertCircle className="text-yellow-500" />
          </div>
          <p className="text-3xl font-bold mt-2">{pendingTasks.length}</p>
          <p className="text-sm text-gray-500 mt-1">Tasks to do</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Overall Progress</h3>
          <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <p className="text-3xl font-bold mt-2">{completionRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Today's Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Today's Tasks</p>
            <p className="text-2xl font-bold">{todayTasks.length}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Completed Today</p>
            <p className="text-2xl font-bold text-green-500">{todayCompleted.length}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Pending Today</p>
            <p className="text-2xl font-bold text-yellow-500">{todayPending.length}</p>
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Activity Timeline</h2>
        <div className="h-[300px]">
          <ResponsiveLine
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
            xScale={{ type: 'point' }}
            yScale={{ 
              type: 'linear', 
              min: 0,
              max: Math.max(...last24Hours.map(d => d.y), 5)
            }}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              legend: 'Time',
              legendOffset: 40
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Tasks Completed',
              legendOffset: -40
            }}
            enablePoints={true}
            pointSize={8}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabelYOffset={-12}
            useMesh={true}
            curve="monotoneX"
            enableArea={true}
            areaOpacity={0.1}
            theme={{
              axis: {
                ticks: {
                  text: {
                    fill: '#666'
                  }
                },
                legend: {
                  text: {
                    fill: '#666'
                  }
                }
              },
              grid: {
                line: {
                  stroke: '#ddd',
                  strokeWidth: 1
                }
              }
            }}
          />
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
            {pendingTasks.slice(0, 5).map((task) => (
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
            {completedTasks
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
    </main>
  );
} 