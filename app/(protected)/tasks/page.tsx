'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CATEGORIES, IMPORTANCE_LEVELS } from '@/types/task';
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
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    category: '',
    importance: 'medium',
    dueDate: new Date()
  });

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

    // Create "Today" folder
    const todayFolder: TaskFolder = {
      name: 'Today',
      type: 'day',
      date: today,
      tasks: tasks.filter(task => {
        const taskDate = task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : null;
        return taskDate === today;
      })
    };
    organized.push(todayFolder);

    // Organize remaining tasks by month and day
    tasks.forEach(task => {
      if (!task.dueDate) return;
      const taskDate = new Date(task.dueDate);
      const monthDate = format(taskDate, 'yyyy-MM');
      const dayDate = format(taskDate, 'yyyy-MM-dd');

      if (dayDate === today) return; // Skip today's tasks as they're already added

      // Find or create month folder
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

      // Find or create day subfolder
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

      // Add task to day subfolder
      dayFolder.tasks.push(task);
      // Also add task to month folder
      monthFolder.tasks.push(task);
    });

    // Sort folders and subfolders
    organized.sort((a, b) => {
      if (a.date === today) return -1;
      if (b.date === today) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    organized.forEach(folder => {
      folder.days?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    setFolders(organized);
    
    // Select "Today" by default
    if (!selectedFolder) {
      setSelectedFolder(today);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTask.title,
          category: newTask.category,
          importance: newTask.importance,
          dueDate: newTask.dueDate,
          folder: 'day',
          folderDate: format(newTask.dueDate, 'yyyy-MM-dd')
        }),
      });

      if (response.ok) {
        setNewTask({
          title: '',
          category: '',
          importance: 'medium',
          dueDate: new Date()
        });
        setShowModal(false);
        fetchAndOrganizeTasks();
      }
    } catch (error) {
      console.error('Error adding task:', error);
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

  // Find the selected folder or subfolder
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
        {/* Sidebar with folders */}
        <div className="col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Task Folders
          </h2>
          <div className="space-y-2">
            {folders.map(folder => (
              <div key={folder.date}>
                {/* Month folder or Today */}
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
                
                {/* Day subfolders */}
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

        {/* Task list */}
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

      {/* Modal de Nueva Tarea */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Add New Task
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Importance Level
                </label>
                <div className="flex gap-4">
                  {IMPORTANCE_LEVELS.map(level => (
                    <label key={level.id} className="flex items-center">
                      <input
                        type="radio"
                        name="importance"
                        value={level.id}
                        checked={newTask.importance === level.id}
                        onChange={(e) => setNewTask({ ...newTask, importance: e.target.value })}
                        className="mr-2 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: level.color }} />
                        <span>{level.label}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  value={format(newTask.dueDate, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: new Date(e.target.value) })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                           dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white 
                           rounded-lg transition-colors"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 