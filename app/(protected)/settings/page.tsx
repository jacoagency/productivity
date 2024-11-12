'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useCategories } from '@/hooks/useCategories';
import { NewCategoryModal } from '@/app/components/NewCategoryModal';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useUser();
  const { categories, importanceLevels, deleteCategory, deleteImportanceLevel } = useCategories();
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showNewImportanceModal, setShowNewImportanceModal] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    type: 'category' | 'importance';
    id: string;
    label: string;
    color: string;
  } | null>(null);

  const handleDelete = async (type: 'category' | 'importance', id: string) => {
    if (type === 'category') {
      await deleteCategory(id);
    } else {
      await deleteImportanceLevel(id);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* User Profile Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Profile
        </h2>
        <div className="flex items-center gap-6">
          <img
            src={user?.imageUrl}
            alt={user?.fullName || 'Profile'}
            className="w-24 h-24 rounded-full"
          />
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              {user?.fullName}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Categories
          </h2>
          <button
            onClick={() => setShowNewCategoryModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg 
                     hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(category => (
            <div
              key={category.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg 
                       bg-gray-50 dark:bg-gray-700/50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium text-gray-800 dark:text-white">
                    {category.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingItem({
                      type: 'category',
                      ...category
                    })}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() => handleDelete('category', category.id)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Importance Levels Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Importance Levels
          </h2>
          <button
            onClick={() => setShowNewImportanceModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg 
                     hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Level
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {importanceLevels.map(level => (
            <div
              key={level.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg 
                       bg-gray-50 dark:bg-gray-700/50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: level.color }}
                  />
                  <span className="font-medium text-gray-800 dark:text-white">
                    {level.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingItem({
                      type: 'importance',
                      ...level
                    })}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() => handleDelete('importance', level.id)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modals */}
      {showNewCategoryModal && (
        <NewCategoryModal
          type="category"
          onClose={() => setShowNewCategoryModal(false)}
          onSave={() => {
            setShowNewCategoryModal(false);
          }}
        />
      )}

      {showNewImportanceModal && (
        <NewCategoryModal
          type="importance"
          onClose={() => setShowNewImportanceModal(false)}
          onSave={() => {
            setShowNewImportanceModal(false);
          }}
        />
      )}

      {editingItem && (
        <NewCategoryModal
          type={editingItem.type}
          initialData={editingItem}
          isEditing
          onClose={() => setEditingItem(null)}
          onSave={() => {
            setEditingItem(null);
          }}
          onDelete={(id) => {
            handleDelete(editingItem.type, id);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
} 