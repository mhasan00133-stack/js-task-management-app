// ============================================================================
// MODULE 1: js/storage.js — localStorage Persistence & Schema Migration (v1 -> v2)
// Project: JavaScript Task Management Application | Intern: Muhammad Hasan Sajid (SEP26-FE21-44)
// ============================================================================

export const STORAGE_KEY = 'appverse_task_manager_data';
export const CURRENT_SCHEMA_VERSION = 2;

export const SEED_TASKS = [
  { id: 'TSK-101', title: 'Architect ES6 Module Structure & Storage Engine', description: 'Decouple CRUD, Command stack, URL state, and Drag-and-Drop modules.', status: 'completed', priority: 'high', dueDate: '2026-10-25', order: 0, tags: ['architecture', 'es6'], createdAt: '2026-10-22T09:00:00Z' },
  { id: 'TSK-102', title: 'Implement 20-Action Command Pattern Undo/Redo Stack', description: 'Create execute() and undo() methods for Create, Update, Delete, Toggle, and Reorder.', status: 'in-progress', priority: 'high', dueDate: '2026-10-26', order: 1, tags: ['command-pattern', 'state'], createdAt: '2026-10-23T11:30:00Z' },
  { id: 'TSK-103', title: 'Build HTML5 Drag and Drop Task Reordering', description: 'Bind dragstart, dragover, drop, and dragend events with visual drop indicators.', status: 'in-progress', priority: 'medium', dueDate: '2026-10-27', order: 2, tags: ['html5-dnd', 'ui'], createdAt: '2026-10-24T14:15:00Z' },
  { id: 'TSK-104', title: 'Configure URLSearchParams Filter & Sort Persistence', description: 'Sync status, priority, sort order, and search query directly with browser URL parameters.', status: 'todo', priority: 'high', dueDate: '2026-10-28', order: 3, tags: ['url-state', 'routing'], createdAt: '2026-10-25T10:00:00Z' },
  { id: 'TSK-105', title: 'Add Debounced Search with <mark> Match Highlighting', description: 'Debounce input at 250ms and highlight matching keywords safely across task cards.', status: 'todo', priority: 'medium', dueDate: '2026-10-29', order: 4, tags: ['search', 'debounce'], createdAt: '2026-10-26T08:00:00Z' }
];

/**
 * Migrates legacy v1 schema records (e.g. { text, done }) to Schema v2.
 */
export function migrateSchemaV1ToV2(rawPayload) {
  const rawTasks = Array.isArray(rawPayload) ? rawPayload : (rawPayload.tasks || []);
  const migratedTasks = rawTasks.map((item, idx) => ({
    id: item.id || `TSK-${100 + idx + 1}`,
    title: item.title || item.text || 'Untitled Task',
    description: item.description || item.notes || 'Migrated from Schema v1 to Schema v2.',
    status: item.status || (item.done ? 'completed' : 'todo'),
    priority: item.priority || 'medium',
    dueDate: item.dueDate || '2026-10-30',
    order: typeof item.order === 'number' ? item.order : idx,
    tags: Array.isArray(item.tags) ? item.tags : ['migrated-v2'],
    createdAt: item.createdAt || new Date().toISOString()
  }));

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    migratedAt: new Date().toISOString(),
    tasks: migratedTasks
  };
}

export function loadTasksFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = { schemaVersion: CURRENT_SCHEMA_VERSION, updatedAt: new Date().toISOString(), tasks: SEED_TASKS };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return { tasks: [...SEED_TASKS], migrationLog: 'Initialized Schema v2 with 5 starter tasks.' };
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) || !parsed.schemaVersion || parsed.schemaVersion < CURRENT_SCHEMA_VERSION) {
      const upgraded = migrateSchemaV1ToV2(parsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(upgraded));
      return { tasks: upgraded.tasks, migrationLog: 'Auto-migrated legacy Schema v1 -> Schema v2.' };
    }
    return { tasks: parsed.tasks || [], migrationLog: `Loaded Schema v${parsed.schemaVersion} (${(parsed.tasks || []).length} tasks).` };
  } catch (err) {
    console.error('[Storage Error]:', err);
    return { tasks: [...SEED_TASKS], migrationLog: 'Fallback to seed tasks after storage error.' };
  }
}

export function saveTasksToStorage(tasks) {
  const payload = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    tasks: tasks.map((t, idx) => ({ ...t, order: idx }))
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}
