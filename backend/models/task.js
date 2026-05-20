const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, '..', 'data', 'tasks.json');

// Ensure data directory and file exist
function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

function readTasks() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeTasks(tasks) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// ── CRUD Operations ──────────────────────────────────

function getAll() {
  return readTasks();
}

function getById(id) {
  return readTasks().find((t) => t.id === id) || null;
}

function create({ title, description = '', priority = 'medium' }) {
  const tasks = readTasks();
  const newTask = {
    id: uuidv4(),
    title,
    description,
    priority,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  writeTasks(tasks);
  return newTask;
}

function update(id, updates) {
  const tasks = readTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  tasks[idx] = { ...tasks[idx], ...updates, id }; // prevent id overwrite
  writeTasks(tasks);
  return tasks[idx];
}

function remove(id) {
  const tasks = readTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  tasks.splice(idx, 1);
  writeTasks(tasks);
  return true;
}

module.exports = { getAll, getById, create, update, remove };
