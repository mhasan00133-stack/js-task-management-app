// ============================================================================
// MODULE 5: js/ui.js — Debounced Search, <mark> Highlighting & DOM Renderer
// Project: JavaScript Task Management Application | Intern: Muhammad Hasan Sajid (SEP26-FE21-44)
// ============================================================================

export function debounce(fn, delay = 250) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function escapeHTML(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function highlightMatches(text = '', query = '') {
  const safeText = escapeHTML(text);
  const cleanQ = (query || '').trim();
  if (!cleanQ) return safeText;
  const escapedRegex = cleanQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedRegex})`, 'gi');
  return safeText.replace(regex, '<mark class="search-highlight">$1</mark>');
}

export function renderTaskList(containerEl, tasks, query) {
  if (!tasks.length) {
    containerEl.innerHTML = `
      <div class="empty-state">
        <h3>No Matching Tasks Found</h3>
        <p>Try clearing the search box (press <code>Esc</code>) or resetting the URL filters.</p>
      </div>
    `;
    return;
  }

  containerEl.innerHTML = tasks.map(t => {
    const titleHtml = highlightMatches(t.title, query);
    const descHtml = highlightMatches(t.description, query);
    const tagsHtml = (t.tags || []).map(tag => `<span class="tag">#${highlightMatches(tag, query)}</span>`).join('');
    const isDone = t.status === 'completed';

    return `
      <article class="task-card ${isDone ? 'task-card--done' : ''}" draggable="true" data-id="${t.id}">
        <div class="task-card__drag" title="Drag to reorder (HTML5 DnD)">⋮⋮</div>
        <input type="checkbox" class="task-card__check" data-action="toggle" data-id="${t.id}" ${isDone ? 'checked' : ''}>
        <div class="task-card__body">
          <div class="task-card__top">
            <span class="task-id">${t.id}</span>
            <h3 class="task-title">${titleHtml}</h3>
            <span class="badge badge--priority-${t.priority}">${t.priority.toUpperCase()}</span>
            <span class="badge badge--status-${t.status}">${t.status}</span>
          </div>
          <p class="task-desc">${descHtml}</p>
          <div class="task-meta">
            <div class="task-tags">${tagsHtml}</div>
            <span>Due: <strong>${t.dueDate}</strong></span>
          </div>
        </div>
        <div class="task-card__actions">
          <button type="button" class="btn-icon" data-action="edit" data-id="${t.id}">Edit</button>
          <button type="button" class="btn-icon btn-icon--danger" data-action="delete" data-id="${t.id}">Delete</button>
        </div>
      </article>
    `;
  }).join('');
}
