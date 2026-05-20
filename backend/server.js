const express = require('express');
const cors = require('cors');
const path = require('path');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API routes
app.use('/api/tasks', taskRoutes);

// Catch-all: serve index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  🚀 TaskFlow server running at http://localhost:${PORT}\n`);
});
