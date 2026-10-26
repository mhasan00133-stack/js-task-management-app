// ============================================================================
// MODULE 6: js/app.js — Main Application Controller, CRUD & Keyboard Shortcuts
// Project: JavaScript Task Management Application | Intern: Muhammad Hasan Sajid (SEP26-FE21-44)
// ============================================================================

import { loadTasksFromStorage, saveTasksToStorage, migrateSchemaV1ToV2 } from './storage.js';
import { CommandManager, TaskMutationCommand } from './command.js';
import { readFiltersFromURL, syncFiltersToURL, applyFiltersAndSort } from './urlState.js';
import { bindDragAndDrop } from './dnd.js';
import { debounce, renderTaskList } from './ui.js';

const loaded = loadTasksFromStorage();
const appState = {
  tasks: loaded.tasks,
  filters: readFiltersFromURL(),
  editingId: null
};

const els = {
  form: document.getElementById('task-form'),
  titleInput: document.getElementById('task-title'),
  descInput: document.getElementById('task-desc'),
  priorityInput: document.getElementById('task-priority'),
  statusInput: document.getElementById('task-status'),
  dueInput: document.getElementById('task-due'),
  submitBtn: document.getElementById('task-submit-btn'),
  searchInput: document.getElementById('search-input'),
  filterStatus: document.getElementById('filter-status'),
  filterPriority: document.getElementById('filter-priority'),
  sortBy: document.getElementById('sort-by'),
  undoBtn: document.getElementById('undo-btn'),
  redoBtn: document.getElementById('redo-btn'),
  migrateBtn: document.getElementById('migrate-test-btn'),
  taskList: document.getElementById('task-list'),
  urlBadge: document.getElementById('url-query-badge'),
  schemaBadge: document.getElementById('schema-log'),
  statTotal: document.getElementById('stat-total'),
  statDone: document.getElementById('stat-done'),
  statPending: document.getElementById('stat-pending')
};

function refreshUI() {
  saveTasksToStorage(appState.tasks);
  const queryStr = syncFiltersToURL(appState.filters);
  if (els.urlBadge) els.urlBadge.textContent = queryStr;
  const visible = applyFiltersAndSort(appState.tasks, appState.filters);
  renderTaskList(els.taskList, visible, appState.filters.q);

  const doneCount = appState.tasks.filter(t => t.status === 'completed').length;
  if (els.statTotal) els.statTotal.textContent = appState.tasks.length;
  if (els.statDone) els.statDone.textContent = doneCount;
  if (els.statPending) els.statPending.textContent = appState.tasks.length - doneCount;
}

const cmdManager = new CommandManager(({ undoCount, redoCount, maxHistory, lastActionLabel }) => {
  if (els.undoBtn) {
    els.undoBtn.disabled = undoCount === 0;
    els.undoBtn.textContent = `↶ Undo (${undoCount}/${maxHistory})`;
  }
  if (els.redoBtn) {
    els.redoBtn.disabled = redoCount === 0;
    els.redoBtn.textContent = `↷ Redo (${redoCount})`;
  }
  if (lastActionLabel && els.schemaBadge) {
    els.schemaBadge.textContent = `Schema v2 | Last Action: ${lastActionLabel}`;
  }
});

function mutateWithCommand(label, nextTasks) {
  const cmd = new TaskMutationCommand(label, appState, nextTasks, refreshUI);
  cmdManager.executeCommand(cmd);
}

function initApp() {
  if (!els.form) return;
  if (els.schemaBadge) els.schemaBadge.textContent = loaded.migrationLog;

  els.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = els.titleInput.value.trim();
    if (!title) return;

    if (appState.editingId) {
      const next = appState.tasks.map(t => t.id === appState.editingId ? {
        ...t,
        title,
        description: els.descInput.value.trim() || t.description,
        priority: els.priorityInput.value,
        status: els.statusInput.value,
        dueDate: els.dueInput.value || t.dueDate
      } : t);
      mutateWithCommand(`Update ${appState.editingId}`, next);
      appState.editingId = null;
      els.submitBtn.textContent = '+ Add Task (Alt+N)';
    } else {
      const newTask = {
        id: `TSK-${100 + appState.tasks.length + 1}`,
        title,
        description: els.descInput.value.trim() || 'Created via Modular CRUD form.',
        priority: els.priorityInput.value,
        status: els.statusInput.value,
        dueDate: els.dueInput.value || '2026-10-30',
        order: appState.tasks.length,
        tags: ['crud', els.priorityInput.value],
        createdAt: new Date().toISOString()
      };
      mutateWithCommand(`Create ${newTask.id}`, [...appState.tasks, newTask]);
    }
    els.form.reset();
  });

  els.taskList.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const action = btn.getAttribute('data-action');

    if (action === 'toggle') {
      const next = appState.tasks.map(t => t.id === id ? {
        ...t,
        status: t.status === 'completed' ? 'todo' : 'completed'
      } : t);
      mutateWithCommand(`Toggle ${id}`, next);
    } else if (action === 'delete') {
      const next = appState.tasks.filter(t => t.id !== id);
      mutateWithCommand(`Delete ${id}`, next);
    } else if (action === 'edit') {
      const target = appState.tasks.find(t => t.id === id);
      if (target) {
        appState.editingId = target.id;
        els.titleInput.value = target.title;
        els.descInput.value = target.description;
        els.priorityInput.value = target.priority;
        els.statusInput.value = target.status;
        els.dueInput.value = target.dueDate;
        els.submitBtn.textContent = `Save ${target.id}`;
        els.titleInput.focus();
      }
    }
  });

  bindDragAndDrop(els.taskList, (draggedId, targetId) => {
    const copy = [...appState.tasks];
    const fromIdx = copy.findIndex(t => t.id === draggedId);
    const toIdx = copy.findIndex(t => t.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, moved);
    const reindexed = copy.map((t, idx) => ({ ...t, order: idx }));
    mutateWithCommand(`Reorder ${draggedId} -> ${targetId}`, reindexed);
  });

  const handleDebouncedSearch = debounce((val) => {
    appState.filters.q = val;
    refreshUI();
  }, 250);

  els.searchInput.addEventListener('input', (e) => handleDebouncedSearch(e.target.value));
  els.filterStatus.addEventListener('change', (e) => { appState.filters.status = e.target.value; refreshUI(); });
  els.filterPriority.addEventListener('change', (e) => { appState.filters.priority = e.target.value; refreshUI(); });
  els.sortBy.addEventListener('change', (e) => { appState.filters.sort = e.target.value; refreshUI(); });

  els.undoBtn.addEventListener('click', () => cmdManager.undo());
  els.redoBtn.addEventListener('click', () => cmdManager.redo());

  if (els.migrateBtn) {
    els.migrateBtn.addEventListener('click', () => {
      const legacyV1 = [
        ...appState.tasks,
        { text: 'Legacy v1 Task Auto-Migrated to Schema v2', done: false }
      ];
      const upgraded = migrateSchemaV1ToV2(legacyV1);
      mutateWithCommand('Schema Migration v1->v2', upgraded.tasks);
    });
  }

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    const inField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
      e.preventDefault();
      cmdManager.undo();
    } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
      e.preventDefault();
      cmdManager.redo();
    } else if ((e.altKey && e.key.toLowerCase() === 'n') || (!inField && e.key.toLowerCase() === 'n')) {
      e.preventDefault();
      els.titleInput.focus();
    } else if (!inField && e.key === '/') {
      e.preventDefault();
      els.searchInput.focus();
    } else if (e.key === 'Escape') {
      els.searchInput.value = '';
      appState.filters.q = '';
      appState.editingId = null;
      els.submitBtn.textContent = '+ Add Task (Alt+N)';
      refreshUI();
    }
  });

  refreshUI();
}

initApp();
