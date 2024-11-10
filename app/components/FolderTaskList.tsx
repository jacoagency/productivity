'use client';

import { useState, useEffect } from 'react';
import { TaskItem } from './TaskItem';
import { format } from 'date-fns';
import { useEventContext } from '../contexts/EventContext';

interface Task {
  _id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  category?: string;
  folder?: string;
  folderDate?: string;
}

interface FolderTaskListProps {
  tasks: Task[];
  folderType: 'day' | 'month' | 'year';
  onTaskUpdate: () => void;
  selectedDate?: string;
}

export function FolderTaskList({ tasks, folderType, onTaskUpdate, selectedDate }: FolderTaskListProps) {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [showModal, setShowModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState(selectedDate || format(new Date(), 'yyyy-MM-dd'));
  const [taskTime, setTaskTime] = useState('12:00');
  const { refreshEvents } = useEventContext();

  // Actualizar las tareas locales cuando cambian las props
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      // Crear fecha con la hora seleccionada
      const selectedDate = new Date(`${taskDate}T${taskTime}`);

      // Primero intentar crear el evento
      const eventResponse = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTaskTitle,
          start: selectedDate.toISOString(), // Usar toISOString para mantener la hora exacta
          end: new Date(selectedDate.getTime() + 60 * 60 * 1000).toISOString(),
          desc: `Task due date`,
          color: '#7C3AED',
          isTaskEvent: true
        }),
      });

      if (eventResponse.status === 409) {
        alert('There is already a task scheduled for this time. Please choose a different time.');
        return;
      }

      if (eventResponse.ok) {
        // Si el evento se creó exitosamente, crear la tarea
        const taskResponse = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: newTaskTitle,
            folder: folderType,
            folderDate: format(selectedDate, folderType === 'day' ? 'yyyy-MM-dd' : 'yyyy-MM'),
            dueDate: selectedDate.toISOString() // Usar toISOString para mantener la hora exacta
          }),
        });

        if (taskResponse.ok) {
          const task = await taskResponse.json();
          setLocalTasks([task, ...localTasks]);
          
          setNewTaskTitle('');
          setTaskDate(format(new Date(), 'yyyy-MM-dd'));
          setTaskTime('12:00');
          setShowModal(false);
          refreshEvents();
          onTaskUpdate();
        }
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTask = async (taskId: string) => {
    try {
      const task = localTasks.find(t => t._id === taskId);
      if (!task) return;

      // Actualizar el estado local inmediatamente para mejor UX
      const newCompletedState = !task.completed;
      setLocalTasks(localTasks.map(t => 
        t._id === taskId ? { ...t, completed: newCompletedState } : t
      ));

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          completed: newCompletedState
        }),
      });

      if (response.ok) {
        // Actualizar el evento en el calendario
        const eventsResponse = await fetch('/api/events');
        const events = await eventsResponse.json();
        const eventToUpdate = events.find((event: any) => 
          event.title === task.title && 
          new Date(event.start).getTime() === new Date(task.dueDate || '').getTime()
        );

        if (eventToUpdate) {
          await fetch(`/api/events/${eventToUpdate._id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              color: newCompletedState ? '#22c55e' : '#7C3AED'
            }),
          });
          refreshEvents();
        }
      } else {
        // Si hay error, revertir el cambio local
        setLocalTasks(localTasks.map(t => 
          t._id === taskId ? { ...t, completed: task.completed } : t
        ));
      }
    } catch (error) {
      console.error('Error updating task:', error);
      // En caso de error, revertir el cambio local
      const task = localTasks.find(t => t._id === taskId);
      if (task) {
        setLocalTasks(localTasks.map(t => 
          t._id === taskId ? { ...t, completed: task.completed } : t
        ));
      }
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const task = localTasks.find(t => t._id === taskId);
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Actualizar el estado local inmediatamente
        setLocalTasks(localTasks.filter(t => t._id !== taskId));

        // Eliminar el evento del calendario si existe
        if (task?.dueDate) {
          const eventsResponse = await fetch('/api/events');
          const events = await eventsResponse.json();
          const eventToDelete = events.find((event: any) => 
            event.title === task.title && 
            new Date(event.start).getTime() === new Date(task.dueDate || '').getTime()
          );

          if (eventToDelete) {
            await fetch(`/api/events/${eventToDelete._id}`, {
              method: 'DELETE',
            });
            refreshEvents();
          }
        }
        onTaskUpdate();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowModal(true)}
        className="w-full p-3 text-left text-gray-500 dark:text-gray-400 border border-dashed 
                 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 
                 dark:hover:border-purple-500 transition-colors"
      >
        + Add a new task...
      </button>

      {localTasks.map(task => (
        <TaskItem 
          key={task._id}
          id={task._id}
          title={task.title}
          completed={task.completed}
          dueDate={task.dueDate}
          onToggle={() => toggleTask(task._id)}
          onDelete={() => deleteTask(task._id)}
        />
      ))}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Add New Task
            </h2>
            <form onSubmit={addTask}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="What needs to be done?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Time
                  </label>
                  <input
                    type="time"
                    value={taskTime}
                    onChange={(e) => setTaskTime(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {taskDate && taskTime && (
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    Task will be due on: {format(new Date(`${taskDate}T${taskTime}`), "EEEE, MMMM d 'at' h:mm a")}
                  </p>
                )}
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