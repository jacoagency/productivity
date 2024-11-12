// Definición de categorías predefinidas
export const CATEGORIES = [
  { id: 'work', label: 'Work', color: '#2563EB' },  // Blue
  { id: 'personal', label: 'Personal', color: '#16A34A' },  // Green
  { id: 'study', label: 'Study', color: '#9333EA' },  // Purple
  { id: 'health', label: 'Health', color: '#DC2626' },  // Red
  { id: 'social', label: 'Social', color: '#CA8A04' },  // Yellow
  { id: 'other', label: 'Other', color: '#6B7280' }  // Gray
] as const;

// Definición de niveles de importancia
export const IMPORTANCE_LEVELS = [
  { id: 'high', label: 'High Priority', color: '#DC2626' },  // Red
  { id: 'medium', label: 'Medium Priority', color: '#CA8A04' },  // Yellow
  { id: 'low', label: 'Low Priority', color: '#16A34A' }  // Green
] as const;

// Tipos para las categorías y niveles de importancia
export type CategoryId = typeof CATEGORIES[number]['id'];
export type ImportanceLevel = typeof IMPORTANCE_LEVELS[number]['id'];

// Interfaz para la tarea
export interface Task {
  _id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  category?: CategoryId;
  importance?: ImportanceLevel;
  folder?: string;
  folderDate?: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interfaz para eventos
export interface Event {
  _id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  desc?: string;
  category?: CategoryId;
  importance?: ImportanceLevel;
  isTaskEvent?: boolean;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
} 