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
    const createDefaultTasks = async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const response = await fetch('/api/tasks/default');
      const existingTasks = await response.json();
      
      if (existingTasks.length === 0) {
        for (const defaultTask of DEFAULT_DAILY_TASKS) {
          await fetch('/api/tasks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...defaultTask,
              dueDate: new Date(),
              folder: 'day',
              folderDate: today,
            }),
          });
        }
      }
    };

    createDefaultTasks().then(() => fetchAndOrganizeTasks());
  }, []);

  const organizeTasks = (tasks: Task[]) => {
    const organized: TaskFolder[] = [];
    const today = new Date();

    tasks.forEach(task => {
      const taskDate = new Date(task.dueDate || new Date());
      const folderDate = format(taskDate, 'yyyy-MM-dd');
      const monthDate = format(taskDate, 'yyyy-MM');
      const yearDate = format(taskDate, 'yyyy');

      if (format(taskDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
        const todayFolder = organized.find(f => f.type === 'day' && f.date === folderDate);
        if (todayFolder) {
          todayFolder.tasks.push(task);
        } else {
          organized.push({
            name: 'Today',
            type: 'day',
            date: folderDate,
            tasks: [task]
          });
        }
      } else {
        const monthFolder = organized.find(f => f.type === 'month' && f.date === monthDate);
        if (monthFolder) {
          monthFolder.tasks.push(task);
        } else {
          organized.push({
            name: format(taskDate, 'MMMM yyyy'),
            type: 'month',
            date: monthDate,
            tasks: [task]
          });
        }
      }
    });

    organized.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setFolders(organized);
    
    if (!selectedFolder && organized.length > 0) {
      setSelectedFolder(organized[0].date);
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

  const selectedFolderData = folders.find(f => f.date === selectedFolder);

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Task Folders
          </h2>
          <div className="space-y-2">
            {folders.map(folder => (
              <button
                key={folder.date}
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
            ))}
          </div>
        </div>

        <div className="col-span-9 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {selectedFolderData ? (
            <SelectedFolderTasks
              folder={selectedFolderData}
              onTaskUpdate={fetchAndOrganizeTasks}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No tasks found. Create a new task to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 