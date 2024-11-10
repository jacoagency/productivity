'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DEFAULT_DAILY_TASKS } from '@/models/DefaultTask';
import { SelectedFolderTasks } from '@/app/components/SelectedFolderTasks';

interface Task {
  _id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  category?: string;
  folder?: string;
  folderDate?: string;
}

interface TaskFolder {
  name: string;
  type: 'day' | 'month' | 'year';
  date: string;
  tasks: Task[];
  days?: TaskFolder[];
}

export default function TasksPage() {
  const [folders, setFolders] = useState<TaskFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchAndOrganizeTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const tasks = await response.json();
        organizeTasks(tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndOrganizeTasks();
  }, []);

  const organizeTasks = (tasks: Task[]) => {
    const organized: TaskFolder[] = [];
    const today = format(new Date(), 'yyyy-MM-dd');

    // Primero, crear la carpeta de "Today" con las tareas por defecto
    const todayFolder: TaskFolder = {
      name: 'Today',
      type: 'day',
      date: today,
      tasks: [
        ...DEFAULT_DAILY_TASKS.map(defaultTask => ({
          _id: `default_${defaultTask.title}`,
          ...defaultTask,
          dueDate: new Date(),
          folder: 'day',
          folderDate: today
        })),
        ...tasks.filter(task => {
          const taskDate = task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : null;
          return taskDate === today;
        })
      ]
    };
    organized.push(todayFolder);

    // Luego, organizar el resto de las tareas por mes y día
    tasks.forEach(task => {
      if (!task.dueDate) return;
      const taskDate = new Date(task.dueDate);
      const monthDate = format(taskDate, 'yyyy-MM');
      const dayDate = format(taskDate, 'yyyy-MM-dd');

      if (dayDate === today) return; // Skip today's tasks as they're already added

      // Encontrar o crear la carpeta del mes
      let monthFolder = organized.find(f => f.type === 'month' && f.date === monthDate);
      if (!monthFolder) {
        monthFolder = {
          name: format(taskDate, 'MMMM yyyy'),
          type: 'month',
          date: monthDate,
          tasks: [],
          days: []
        };
        organized.push(monthFolder);
      }

      // Encontrar o crear la subcarpeta del día
      let dayFolder = monthFolder.days?.find(d => d.date === dayDate);
      if (!dayFolder) {
        dayFolder = {
          name: format(taskDate, 'EEEE, MMMM d'),
          type: 'day',
          date: dayDate,
          tasks: []
        };
        monthFolder.days?.push(dayFolder);
      }

      // Añadir la tarea a la subcarpeta del día
      dayFolder.tasks.push(task);
      // También añadir la tarea a la carpeta del mes
      monthFolder.tasks.push(task);
    });

    // Ordenar carpetas y subcarpetas
    organized.sort((a, b) => {
      if (a.date === today) return -1;
      if (b.date === today) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    organized.forEach(folder => {
      folder.days?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    setFolders(organized);
    
    // Seleccionar "Today" por defecto
    if (!selectedFolder) {
      setSelectedFolder(today);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
        </div>
      </div>
    );
  }

  // Encontrar la carpeta o subcarpeta seleccionada
  let selectedFolderData = folders.find(f => f.date === selectedFolder);
  if (!selectedFolderData) {
    for (const folder of folders) {
      const dayFolder = folder.days?.find(d => d.date === selectedFolder);
      if (dayFolder) {
        selectedFolderData = dayFolder;
        break;
      }
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar con carpetas */}
        <div className="col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Task Folders
          </h2>
          <div className="space-y-2">
            {folders.map(folder => (
              <div key={folder.date}>
                {/* Carpeta del mes o Today */}
                <button
                  onClick={() => setSelectedFolder(folder.date)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedFolder === folder.date
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{folder.name}</span>
                    <span className="text-sm bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                      {folder.tasks.length}
                    </span>
                  </div>
                </button>
                
                {/* Subcarpetas de días */}
                {folder.days?.map(day => (
                  <button
                    key={day.date}
                    onClick={() => setSelectedFolder(day.date)}
                    className={`w-full text-left pl-8 pr-4 py-2 text-sm rounded-lg transition-colors ${
                      selectedFolder === day.date
                        ? 'bg-purple-50 dark:bg-purple-900/50 text-purple-900 dark:text-purple-100'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{day.name}</span>
                      <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                        {day.tasks.length}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Lista de tareas */}
        <div className="col-span-9 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {selectedFolderData ? (
            <SelectedFolderTasks
              folder={selectedFolderData}
              onTaskUpdate={fetchAndOrganizeTasks}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                Select a folder to view tasks
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 