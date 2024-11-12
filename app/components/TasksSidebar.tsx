'use client';

import { useState } from 'react';
import { CalendarDays, Tag } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';

interface TasksSidebarProps {
  onViewChange: (view: 'date' | 'category') => void;
  selectedView: 'date' | 'category';
  selectedId?: string;
  onSelect: (id: string) => void;
  dateFolders: Array<{
    name: string;
    date: string;
    count: number;
  }>;
  categoryFolders: Array<{
    id: string;
    name: string;
    count: number;
    color: string;
  }>;
}

export function TasksSidebar({
  onViewChange,
  selectedView,
  selectedId,
  onSelect,
  dateFolders,
  categoryFolders
}: TasksSidebarProps) {
  const { categories } = useCategories();

  return (
    <div className="w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
      {/* View Selector */}
      <div className="mb-6 space-y-2">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          View Tasks By
        </h2>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onViewChange('date')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              selectedView === 'date'
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Date</span>
          </button>
          <button
            onClick={() => onViewChange('category')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              selectedView === 'category'
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Category</span>
          </button>
        </div>
      </div>

      {/* Lista de carpetas */}
      <div className="space-y-2">
        {selectedView === 'date' ? (
          // Vista por fecha
          dateFolders.map((folder) => (
            <button
              key={folder.date}
              onClick={() => onSelect(folder.date)}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                selectedId === folder.date
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span>{folder.name}</span>
              <span className="text-sm bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                {folder.count}
              </span>
            </button>
          ))
        ) : (
          // Vista por categoría
          categoryFolders.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                selectedId === category.id
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span>{category.name}</span>
              </div>
              <span className="text-sm bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                {category.count}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
} 