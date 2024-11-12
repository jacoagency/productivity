import { useState, useEffect } from 'react';
import { CATEGORIES, IMPORTANCE_LEVELS } from '@/types/task';

interface Category {
  id: string;
  label: string;
  color: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([...CATEGORIES]);
  const [importanceLevels, setImportanceLevels] = useState([...IMPORTANCE_LEVELS]);

  useEffect(() => {
    fetchCategories();
    fetchImportanceLevels();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const customCategories = await response.json();
        setCategories([
          ...CATEGORIES,
          ...customCategories.map((cat: any) => ({
            id: cat._id,
            label: cat.label,
            color: cat.color
          }))
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchImportanceLevels = async () => {
    try {
      const response = await fetch('/api/importance-levels');
      if (response.ok) {
        const customLevels = await response.json();
        setImportanceLevels([
          ...IMPORTANCE_LEVELS,
          ...customLevels.map((level: any) => ({
            id: level._id,
            label: level.label,
            color: level.color
          }))
        ]);
      }
    } catch (error) {
      console.error('Error fetching importance levels:', error);
    }
  };

  const createCategory = async (newCategory: { label: string; color: string }) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        const category = await response.json();
        setCategories(prev => [...prev, {
          id: category._id,
          label: category.label,
          color: category.color
        }]);
        return category._id;
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const createImportanceLevel = async (newLevel: { label: string; color: string }) => {
    try {
      const response = await fetch('/api/importance-levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLevel),
      });

      if (response.ok) {
        const level = await response.json();
        setImportanceLevels(prev => [...prev, {
          id: level._id,
          label: level.label,
          color: level.color
        }]);
        return level._id;
      }
    } catch (error) {
      console.error('Error creating importance level:', error);
    }
  };

  const updateCategory = async (id: string, updates: { label: string; color: string }) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        setCategories(prev => prev.map(cat => 
          cat.id === id ? { ...cat, ...updates } : cat
        ));
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const updateImportanceLevel = async (id: string, updates: { label: string; color: string }) => {
    try {
      const response = await fetch(`/api/importance-levels/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        setImportanceLevels(prev => prev.map(level => 
          level.id === id ? { ...level, ...updates } : level
        ));
      }
    } catch (error) {
      console.error('Error updating importance level:', error);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCategories(prev => prev.filter(cat => cat.id !== id));
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const deleteImportanceLevel = async (id: string) => {
    try {
      const response = await fetch(`/api/importance-levels/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setImportanceLevels(prev => prev.filter(level => level.id !== id));
      }
    } catch (error) {
      console.error('Error deleting importance level:', error);
    }
  };

  return {
    categories,
    importanceLevels,
    createCategory,
    createImportanceLevel,
    updateCategory,
    updateImportanceLevel,
    deleteCategory,
    deleteImportanceLevel,
    refreshCategories: fetchCategories,
    refreshImportanceLevels: fetchImportanceLevels
  };
} 