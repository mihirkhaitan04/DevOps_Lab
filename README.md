# ⚡ TaskFlow

A modern, full-stack task management app built with **Express.js** (backend) and **Vanilla JS** (frontend).

## Project Structure

```
DemoProj_Git/
├── backend/
│   ├── server.js          # Express entry point
│   ├── routes/
│   │   └── tasks.js       # REST API routes (CRUD)
│   ├── models/
│   │   └── task.js        # Data model with JSON persistence
│   └── data/
│       └── tasks.json     # JSON file database
├── frontend/
│   ├── index.html         # Main HTML page
│   ├── css/
│   │   └── style.css      # Design system & styles
│   └── js/
│       └── app.js         # Frontend logic
├── package.json           # Dependencies & scripts
└── README.md
```

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm run dev
```

Then open **http://localhost:3000** in your browser.

## API Endpoints

| Method   | Endpoint          | Description       |
|----------|-------------------|-------------------|
| `GET`    | `/api/tasks`      | List all tasks    |
| `GET`    | `/api/tasks/:id`  | Get a single task |
| `POST`   | `/api/tasks`      | Create a task     |
| `PUT`    | `/api/tasks/:id`  | Update a task     |
| `DELETE` | `/api/tasks/:id`  | Delete a task     |

## Features

- ✅ Full CRUD operations via REST API
- ✅ Task priorities (Low / Medium / High)
- ✅ Filter by status (All / Pending / Completed)
- ✅ Edit tasks via modal dialog
- ✅ Persistent storage (JSON file)
- ✅ Animated glassmorphism UI
- ✅ Fully responsive design
