// ============================================================================
// MODULE 4: js/dnd.js — HTML5 Drag and Drop Task Reordering
// Project: JavaScript Task Management Application | Intern: Muhammad Hasan Sajid (SEP26-FE21-44)
// ============================================================================

export function bindDragAndDrop(containerEl, onReorderIds) {
  let draggedId = null;

  containerEl.addEventListener('dragstart', (e) => {
    const card = e.target.closest('.task-card');
    if (!card) return;
    draggedId = card.getAttribute('data-id');
    card.classList.add('dragging');
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', draggedId);
    }
  });

  containerEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    const targetCard = e.target.closest('.task-card');
    containerEl.querySelectorAll('.task-card').forEach(c => c.classList.remove('drag-over'));
    if (targetCard && targetCard.getAttribute('data-id') !== draggedId) {
      targetCard.classList.add('drag-over');
    }
  });

  containerEl.addEventListener('drop', (e) => {
    e.preventDefault();
    const targetCard = e.target.closest('.task-card');
    containerEl.querySelectorAll('.task-card').forEach(c => c.classList.remove('drag-over', 'dragging'));
    if (!targetCard || !draggedId) return;
    const targetId = targetCard.getAttribute('data-id');
    if (draggedId !== targetId) {
      onReorderIds(draggedId, targetId);
    }
    draggedId = null;
  });

  containerEl.addEventListener('dragend', () => {
    containerEl.querySelectorAll('.task-card').forEach(c => c.classList.remove('drag-over', 'dragging'));
    draggedId = null;
  });
}
