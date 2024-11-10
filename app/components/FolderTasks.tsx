'use client';

import { TaskItem } from './TaskItem';
import { format } from 'date-fns';

interface FolderTasksProps {
  tasks: any[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export function FolderTasks({ tasks, onToggleTask, onDeleteTask }: FolderTasksProps) {
  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <TaskItem
          key={task._id}
          id={task._id}
          title={task.title}
          completed={task.completed}
          dueDate={task.dueDate}
          onToggle={() => onToggleTask(task._id)}
          onDelete={() => onDeleteTask(task._id)}
        />
      ))}
    </div>
  );
} 