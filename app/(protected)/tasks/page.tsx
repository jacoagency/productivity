import { TaskList } from '../../components/TaskList';

export default function Tasks() {
  return (
    <main className="container mx-auto p-6 sm:p-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
        Task Management
      </h1>
      <TaskList />
    </main>
  );
} 