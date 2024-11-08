'use client';

interface TaskItemProps {
  title: string;
  completed: boolean;
  onToggle: () => void;
}

export function TaskItem({ title, completed, onToggle }: TaskItemProps) {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <input 
        type="checkbox" 
        checked={completed}
        onChange={onToggle}
        className="w-5 h-5 accent-purple-600 rounded-full"
      />
      <span className={`flex-1 text-gray-800 dark:text-gray-200 ${completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
        {title}
      </span>
    </div>
  );
} 