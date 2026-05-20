const express = require('express');
const router = express.Router();
const Task = require('../models/task');

// GET /api/tasks — list all tasks
router.get('/', (req, res) => {
  const tasks = Task.getAll();
  res.json(tasks);
});

// GET /api/tasks/:id — get single task
router.get('/:id', (req, res) => {
  const task = Task.getById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// POST /api/tasks — create a new task
router.post('/', (req, res) => {
  const { title, description, priority } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const task = Task.create({ title: title.trim(), description, priority });
  res.status(201).json(task);
});

// PUT /api/tasks/:id — update a task
router.put('/:id', (req, res) => {
  const updated = Task.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Task not found' });
  res.json(updated);
});

// DELETE /api/tasks/:id — delete a task
router.delete('/:id', (req, res) => {
  const removed = Task.remove(req.params.id);
  if (!removed) return res.status(404).json({ error: 'Task not found' });
  res.status(204).end();
});

module.exports = router;
