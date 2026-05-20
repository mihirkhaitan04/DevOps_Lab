// ── TaskFlow — Frontend App ──────────────────────────
const API = '/api/tasks';

// State
let tasks = [];
let currentFilter = 'all';
let selectedPriority = 'medium';

// DOM references
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const addForm = document.getElementById('add-task-form');
const titleInput = document.getElementById('task-title');
const descInput = document.getElementById('task-description');
const filterBtns = document.querySelectorAll('.filter-btn');
const statTotal = document.querySelector('#stat-total .stat-value');
const statDone = document.querySelector('#stat-done .stat-value');
const statPending = document.querySelector('#stat-pending .stat-value');

// Edit modal
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-task-form');
const editIdField = document.getElementById('edit-task-id');
const editTitle = document.getElementById('edit-title');
const editDesc = document.getElementById('edit-description');
const cancelEditBtn = document.getElementById('btn-cancel-edit');
let editPriority = 'medium';

// ── API helpers ──────────────────────────────────────
async function fetchTasks() {
  const res = await fetch(API);
  tasks = await res.json();
  render();
}

async function createTask(data) {
  await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  await fetchTasks();
}

async function updateTask(id, data) {
  await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  await fetchTasks();
}

async function deleteTask(id) {
  await fetch(`${API}/${id}`, { method: 'DELETE' });
  await fetchTasks();
}

// ── Rendering ────────────────────────────────────────
function render() {
  const filtered = tasks.filter((t) => {
    if (currentFilter === 'pending') return !t.completed;
    if (currentFilter === 'completed') return t.completed;
    return true;
  });

  // Stats
  statTotal.textContent = tasks.length;
  statDone.textContent = tasks.filter((t) => t.completed).length;
  statPending.textContent = tasks.filter((t) => !t.completed).length;

  // Empty state
  if (filtered.length === 0) {
    taskList.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  taskList.innerHTML = filtered
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(
      (t, i) => `
    <li class="task-card ${t.completed ? 'completed' : ''}" style="animation-delay:${i * 0.05}s" data-id="${t.id}">
      <input type="checkbox" class="task-checkbox" ${t.completed ? 'checked' : ''} data-id="${t.id}" aria-label="Toggle completion" />
      <div class="task-body">
        <div class="task-header">
          <span class="task-title">${escapeHTML(t.title)}</span>
          <span class="task-priority-badge ${t.priority}">${t.priority}</span>
        </div>
        ${t.description ? `<p class="task-desc">${escapeHTML(t.description)}</p>` : ''}
        <span class="task-meta">${formatDate(t.createdAt)}</span>
      </div>
      <div class="task-actions">
        <button class="task-action-btn edit" data-id="${t.id}" title="Edit">✏️</button>
        <button class="task-action-btn delete" data-id="${t.id}" title="Delete">🗑️</button>
      </div>
    </li>
  `
    )
    .join('');
}

// ── Event listeners ──────────────────────────────────

// Add task
addForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;
  createTask({ title, description: descInput.value.trim(), priority: selectedPriority });
  titleInput.value = '';
  descInput.value = '';
});

// Priority selector (add form)
document.getElementById('priority-selector').addEventListener('click', (e) => {
  const btn = e.target.closest('.priority-btn');
  if (!btn) return;
  document.querySelectorAll('#priority-selector .priority-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  selectedPriority = btn.dataset.priority;
});

// Filters
filterBtns.forEach((btn) =>
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  })
);

// Task list delegation (checkbox, edit, delete)
taskList.addEventListener('click', (e) => {
  const checkbox = e.target.closest('.task-checkbox');
  if (checkbox) {
    updateTask(checkbox.dataset.id, { completed: checkbox.checked });
    return;
  }
  const editBtn = e.target.closest('.task-action-btn.edit');
  if (editBtn) {
    openEditModal(editBtn.dataset.id);
    return;
  }
  const delBtn = e.target.closest('.task-action-btn.delete');
  if (delBtn) {
    deleteTask(delBtn.dataset.id);
  }
});

// Edit modal
function openEditModal(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  editIdField.value = task.id;
  editTitle.value = task.title;
  editDesc.value = task.description || '';
  editPriority = task.priority;
  document.querySelectorAll('#edit-priority-selector .priority-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.priority === editPriority);
  });
  editModal.style.display = 'flex';
}

document.getElementById('edit-priority-selector').addEventListener('click', (e) => {
  const btn = e.target.closest('.priority-btn');
  if (!btn) return;
  document.querySelectorAll('#edit-priority-selector .priority-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  editPriority = btn.dataset.priority;
});

editForm.addEventListener('submit', (e) => {
  e.preventDefault();
  updateTask(editIdField.value, {
    title: editTitle.value.trim(),
    description: editDesc.value.trim(),
    priority: editPriority,
  });
  editModal.style.display = 'none';
});

cancelEditBtn.addEventListener('click', () => {
  editModal.style.display = 'none';
});

editModal.addEventListener('click', (e) => {
  if (e.target === editModal) editModal.style.display = 'none';
});

// ── Utilities ────────────────────────────────────────
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Init ─────────────────────────────────────────────
fetchTasks();
