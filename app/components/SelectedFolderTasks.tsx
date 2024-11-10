'use client';

import { FolderTaskList } from './FolderTaskList';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

interface Task {
  _id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  category?: string;
  folder?: string;
  folderDate?: string;
}

interface SelectedFolderTasksProps {
  folder: {
    name: string;
    type: 'day' | 'month' | 'year';
    date: string;
    tasks: Task[];
  };
  onTaskUpdate: () => void;
}

export function SelectedFolderTasks({ folder, onTaskUpdate }: SelectedFolderTasksProps) {
  const [folderTasks, setFolderTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchFolderTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        if (response.ok) {
          const allTasks = await response.json();
          // Filtrar tareas por la fecha de la carpeta
          const tasksForFolder = allTasks.filter((task: Task) => {
            if (!task.dueDate) return false;
            const taskDate = format(new Date(task.dueDate), 'yyyy-MM-dd');
            return taskDate === folder.date;
          });
          setFolderTasks(tasksForFolder);
        }
      } catch (error) {
        console.error('Error fetching folder tasks:', error);
      }
    };

    fetchFolderTasks();
  }, [folder.date]);

  const getCompletionStats = () => {
    const total = folderTasks.length;
    const completed = folderTasks.filter(task => task.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  };

  const stats = getCompletionStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {folder.name}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {folder.type === 'day' 
              ? format(new Date(folder.date), 'EEEE, MMMM d, yyyy')
              : format(new Date(folder.date + '-01'), 'MMMM yyyy')}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {stats.percentage}%
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {stats.completed} of {stats.total} tasks completed
          </p>
        </div>
      </div>

      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-purple-600 transition-all duration-500"
          style={{ width: `${stats.percentage}%` }}
        />
      </div>

      <FolderTaskList
        tasks={folderTasks}
        folderType={folder.type}
        onTaskUpdate={onTaskUpdate}
        selectedDate={folder.date}
      />
    </div>
  );
} 