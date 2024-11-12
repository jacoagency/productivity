'use client';

import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';

interface NewCategoryModalProps {
  type: 'category' | 'importance';
  onClose: () => void;
  onSave: (id: string) => void;
  initialData?: { id: string; label: string; color: string };
  isEditing?: boolean;
  onDelete?: (id: string) => void;
}

export function NewCategoryModal({ 
  type, 
  onClose, 
  onSave, 
  initialData,
  isEditing,
  onDelete 
}: NewCategoryModalProps) {
  const [label, setLabel] = useState(initialData?.label || '');
  const [color, setColor] = useState(initialData?.color || '#6366F1');
  const [error, setError] = useState('');
  const { createCategory, createImportanceLevel, updateCategory, updateImportanceLevel } = useCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!label.trim()) {
      setError('Name is required');
      return;
    }

    if (!color) {
      setError('Color is required');
      return;
    }

    const newItem = {
      label: label.trim(),
      color
    };

    try {
      let id;
      if (isEditing && initialData) {
        if (type === 'category') {
          await updateCategory(initialData.id, newItem);
          id = initialData.id;
        } else {
          await updateImportanceLevel(initialData.id, newItem);
          id = initialData.id;
        }
      } else {
        id = await (type === 'category' 
          ? createCategory(newItem)
          : createImportanceLevel(newItem));
      }

      if (id) {
        onSave(id);
        onClose();
      }
    } catch (error) {
      setError('Failed to save. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    
    try {
      if (onDelete) {
        await onDelete(initialData.id);
        onClose();
      }
    } catch (error) {
      setError('Failed to delete. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {isEditing ? 'Edit' : 'Create New'} {type === 'category' ? 'Category' : 'Importance Level'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={`Enter ${type} name`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex gap-4 items-center">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-10 rounded cursor-pointer"
                required
              />
              <div 
                className="flex-1 p-3 rounded-lg"
                style={{ backgroundColor: `${color}20`, color: color }}
              >
                Preview Text
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
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
              {isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 