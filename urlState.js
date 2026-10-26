// ============================================================================
// MODULE 3: js/urlState.js — Filtering, Sorting & URL Parameter Persistence
// Project: JavaScript Task Management Application | Intern: Muhammad Hasan Sajid (SEP26-FE21-44)
// ============================================================================

export function readFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  return {
    status: params.get('status') || 'all',
    priority: params.get('priority') || 'all',
    sort: params.get('sort') || 'custom',
    q: params.get('q') || ''
  };
}

export function syncFiltersToURL(filters) {
  const params = new URLSearchParams();
  params.set('status', filters.status || 'all');
  params.set('priority', filters.priority || 'all');
  params.set('sort', filters.sort || 'custom');
  if (filters.q && filters.q.trim()) {
    params.set('q', filters.q.trim());
  }
  const queryString = params.toString();
  const newUrl = `${window.location.pathname}?${queryString}`;
  try {
    window.history.replaceState({ ...filters }, '', newUrl);
  } catch (e) {
    // Ignore history security restriction on file:// protocol
  }
  return `?${queryString}`;
}

const PRIORITY_WEIGHT = { high: 3, medium: 2, low: 1 };

export function applyFiltersAndSort(tasks, filters) {
  const q = (filters.q || '').trim().toLowerCase();
  const filtered = tasks.filter(task => {
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (q) {
      const hay = `${task.id} ${task.title} ${task.description} ${(task.tags || []).join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return filtered.sort((a, b) => {
    if (filters.sort === 'priority-desc') {
      return (PRIORITY_WEIGHT[b.priority] || 0) - (PRIORITY_WEIGHT[a.priority] || 0);
    }
    if (filters.sort === 'dueDate-asc') {
      return String(a.dueDate).localeCompare(String(b.dueDate));
    }
    if (filters.sort === 'createdAt-desc') {
      return String(b.createdAt).localeCompare(String(a.createdAt));
    }
    return (a.order || 0) - (b.order || 0);
  });
}
