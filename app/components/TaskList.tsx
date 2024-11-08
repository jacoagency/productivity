'use client';

import { useState } from 'react';
import { TaskItem } from './TaskItem';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Complete project presentation', completed: false },
    { id: '2', title: 'Review weekly goals', completed: true },
    { id: '3', title: 'Schedule team meeting', completed: false },
  ]);

  const [newTask, setNewTask] = useState('');

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    setTasks([...tasks, {
      id: Date.now().toString(),
      title: newTask,
      completed: false
    }]);
    setNewTask('');
  };

  return (
    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Today's Tasks
        </h2>
      </div>
      
      <form onSubmit={addTask} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 p-2 border border-gray-200 dark:border-gray-700 rounded-lg 
                     bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200"
          />
          <button 
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add Task
          </button>
        </div>
      </form>
      
      <div className="space-y-3">
        {tasks.map(task => (
          <TaskItem 
            key={task.id}
            title={task.title}
            completed={task.completed}
            onToggle={() => toggleTask(task.id)}
          />
        ))}
      </div>
    </div>
  );
} 