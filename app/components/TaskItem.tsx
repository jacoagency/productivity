'use client';

interface TaskItemProps {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  onToggle: () => void;
  onDelete: () => void;
}

export function TaskItem({ id, title, completed, dueDate, onToggle, onDelete }: TaskItemProps) {
  const getDueStatus = () => {
    if (!dueDate) return null;
    
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (completed) return { color: 'text-green-500', text: 'Completed' };
    if (diffTime < 0) return { color: 'text-red-500', text: 'Overdue' };
    if (diffDays === 0) return { color: 'text-orange-500', text: 'Due today' };
    if (diffDays === 1) return { color: 'text-yellow-500', text: 'Due tomorrow' };
    if (diffDays < 7) return { color: 'text-blue-500', text: `Due in ${diffDays} days` };
    return { color: 'text-gray-500', text: formatDueDate(due) };
  };

  const formatDueDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // If it's today
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit'
      })}`;
    }
    
    // If it's tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit'
      })}`;
    }
    
    // If it's within 7 days
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return `${date.toLocaleDateString('en-US', { weekday: 'long' })} at ${
        date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit'
        })
      }`;
    }
    
    // Otherwise, show full date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const status = dueDate ? getDueStatus() : null;

  return (
    <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <input 
        type="checkbox" 
        checked={completed}
        onChange={onToggle}
        className="w-5 h-5 accent-purple-600 rounded-full"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-gray-800 dark:text-gray-200 ${completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
            {title}
          </span>
          {status && (
            <span className={`text-xs px-2 py-1 rounded-full bg-opacity-10 dark:bg-opacity-20 ${status.color} bg-current`}>
              {status.text}
            </span>
          )}
        </div>
        {dueDate && !completed && (
          <p className={`text-sm mt-1 ${status?.color}`}>
            {formatDueDate(new Date(dueDate))}
          </p>
        )}
      </div>
      <button
        onClick={onDelete}
        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg group"
        aria-label="Delete task"
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
  );
} 