'use client';

import { useState, useEffect } from 'react';

interface DefaultTask {
  _id?: string;
  title: string;
  category: string;
  estimatedTime: number;
  completed: boolean;
}

export default function SettingsPage() {
  const [defaultTasks, setDefaultTasks] = useState<DefaultTask[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState<DefaultTask>({
    title: '',
    category: '',
    estimatedTime: 30,
    completed: false
  });

  // Cargar tareas por defecto
  useEffect(() => {
    const fetchDefaultTasks = async () => {
      try {
        const response = await fetch('/api/settings/default-tasks');
        if (response.ok) {
          const data = await response.json();
          setDefaultTasks(data);
        }
      } catch (error) {
        console.error('Error fetching default tasks:', error);
      }
    };

    fetchDefaultTasks();
  }, []);

  const addDefaultTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/settings/default-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        const task = await response.json();
        setDefaultTasks([...defaultTasks, task]);
        setNewTask({
          title: '',
          category: '',
          estimatedTime: 30,
          completed: false
        });
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error adding default task:', error);
    }
  };

  const deleteDefaultTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/settings/default-tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDefaultTasks(defaultTasks.filter(task => task._id !== taskId));
      }
    } catch (error) {
      console.error('Error deleting default task:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Default Tasks Settings
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Configure your daily default tasks
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add Default Task
          </button>
        </div>

        <div className="space-y-4">
          {defaultTasks.map(task => (
            <div 
              key={task._id}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">
                  {task.title}
                </h3>
                <div className="flex gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                  <span>{task.category}</span>
                  <span>{task.estimatedTime} minutes</span>
                </div>
              </div>
              <button
                onClick={() => task._id && deleteDefaultTask(task._id)}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg group"
              >
                <svg 
                  className="w-5 h-5 text-red-500 group-hover:text-red-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para añadir tarea por defecto */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Add Default Task
            </h2>
            <form onSubmit={addDefaultTask}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estimated Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={newTask.estimatedTime}
                    onChange={(e) => setNewTask({ ...newTask, estimatedTime: parseInt(e.target.value) })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
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