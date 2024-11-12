'use client';

import { format } from 'date-fns';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { NewCategoryModal } from '@/app/components/NewCategoryModal';
import { useCategories } from '@/hooks/useCategories';

interface Task {
  _id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  category?: string;
  importance?: string;
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

const getDefaultDueDate = () => {
  const date = new Date();
  date.setHours(9, 0, 0, 0); // Set to 9:00:00.000 AM
  return date;
};

export function SelectedFolderTasks({ folder, onTaskUpdate }: SelectedFolderTasksProps) {
  const [showModal, setShowModal] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showNewImportanceModal, setShowNewImportanceModal] = useState(false);
  const { categories, importanceLevels, createCategory, createImportanceLevel } = useCategories();
  const [newTask, setNewTask] = useState({
    title: '',
    category: '',
    importance: 'medium',
    dueDate: getDefaultDueDate()
  });

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTask,
          folder: folder.type,
          folderDate: folder.date
        }),
      });

      if (response.status === 409) {
        alert('This time slot overlaps with another task. Please choose a different time.');
        return;
      }

      if (response.ok) {
        setNewTask({
          title: '',
          category: '',
          importance: 'medium',
          dueDate: getDefaultDueDate()
        });
        setShowModal(false);
        onTaskUpdate();
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed,
          completedAt: completed ? new Date() : null,
        }),
      });
      onTaskUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const calculateProgress = () => {
    if (folder.tasks.length === 0) return 0;
    const completedTasks = folder.tasks.filter(task => task.completed).length;
    return (completedTasks / folder.tasks.length) * 100;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {folder.name}
          </h2>
          <div className="mt-2 w-64">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-900 dark:text-gray-300">Progress</span>
              <span className="text-sm text-gray-900 dark:text-gray-300">
                {calculateProgress().toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-purple-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg 
                   hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {folder.tasks.map(task => {
          const category = categories.find(c => c.id === task.category);
          const importance = importanceLevels.find(i => i.id === task.importance);

          return (
            <div
              key={task._id}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={(e) => handleToggleTask(task._id, e.target.checked)}
                className="h-5 w-5 text-purple-600 rounded border-gray-300"
              />
              <span className={`flex-1 text-gray-900 dark:text-white ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                {task.title}
              </span>
              
              {category && (
                <span 
                  className="px-3 py-1 rounded-full text-sm"
                  style={{ 
                    backgroundColor: `${category.color}20`,
                    color: category.color 
                  }}
                >
                  {category.label}
                </span>
              )}
              
              {importance && (
                <span 
                  className="px-3 py-1 rounded-full text-sm"
                  style={{ 
                    backgroundColor: `${importance.color}20`,
                    color: importance.color 
                  }}
                >
                  {importance.label}
                </span>
              )}

              <button
                onClick={() => handleDeleteTask(task._id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          );
        })}
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
                <div className="flex gap-2">
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryModal(true)}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    New
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Importance Level
                </label>
                <div className="flex gap-2">
                  <select
                    value={newTask.importance}
                    onChange={(e) => setNewTask({ ...newTask, importance: e.target.value })}
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Importance</option>
                    {importanceLevels.map(level => (
                      <option key={level.id} value={level.id}>{level.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewImportanceModal(true)}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    New
                  </button>
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

      {showNewCategoryModal && (
        <NewCategoryModal
          type="category"
          onClose={() => setShowNewCategoryModal(false)}
          onSave={(id) => {
            setNewTask({ ...newTask, category: id });
            setShowNewCategoryModal(false);
          }}
        />
      )}

      {showNewImportanceModal && (
        <NewCategoryModal
          type="importance"
          onClose={() => setShowNewImportanceModal(false)}
          onSave={(id) => {
            setNewTask({ ...newTask, importance: id });
            setShowNewImportanceModal(false);
          }}
        />
      )}
    </div>
  );
} 