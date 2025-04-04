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
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [taskDate, setTaskDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [taskTime, setTaskTime] = useState('12:00');
  const { refreshEvents } = useEventContext();

  // Cargar tareas desde la API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  const updateCalendarEvent = async (task: Task, completed: boolean) => {
    try {
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
            color: completed ? '#22c55e' : '#7C3AED'
          }),
        });

        refreshEvents();
      }
    } catch (error) {
      console.error('Error updating calendar event:', error);
    }
  };

  const toggleTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t._id === taskId);
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          completed: !task?.completed
        }),
      });

      if (response.ok) {
        setTasks(tasks.map(task => 
          task._id === taskId ? { 
            ...task, 
            completed: !task.completed
          } : task
        ));

        if (task?.dueDate) {
          await updateCalendarEvent(task, !task.completed);
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const taskToDelete = tasks.find(task => task._id === taskId);
        
        if (taskToDelete?.dueDate) {
          const eventsResponse = await fetch('/api/events');
          if (eventsResponse.ok) {
            const events = await eventsResponse.json();
            const eventToDelete = events.find((event: any) => 
              event.title === taskToDelete.title && 
              new Date(event.start).getTime() === new Date(taskToDelete.dueDate || new Date()).getTime()
            );

            if (eventToDelete) {
              await fetch(`/api/events/${eventToDelete._id}`, {
                method: 'DELETE',
              });
            }
          }
        }

        setTasks(tasks.filter(task => task._id !== taskId));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    try {
      // Crear fecha con la hora seleccionada
      const [hours, minutes] = taskTime.split(':');
      const selectedDate = new Date(taskDate);
      selectedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Crear la tarea
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTask,
          dueDate: selectedDate,
        }),
      });

      if (response.ok) {
        const task = await response.json();
        setTasks([task, ...tasks]);

        // Crear el evento en el calendario
        await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: task.title,
            start: selectedDate,
            end: new Date(selectedDate.getTime() + 60 * 60 * 1000), // 1 hora después
            desc: `Task due date`,
            color: '#7C3AED',
            isTaskEvent: true
          }),
        });

        setNewTask('');
        setTaskDate(format(new Date(), 'yyyy-MM-dd'));
        setTaskTime('12:00');
        setShowModal(false);
        refreshEvents(); // Actualizar el calendario
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <button
        onClick={() => setShowModal(true)}
        className="w-full p-3 text-left text-gray-500 dark:text-gray-400 border border-dashed 
                 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 
                 dark:hover:border-purple-500 transition-colors mb-6"
      >
        + Add a new task...
      </button>
      
      <div className="space-y-3">
        {tasks.map(task => (
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
      </div>

      {/* Modal para añadir tarea */}
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
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
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