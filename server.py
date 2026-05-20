import json
import os
import uuid
import datetime
from http.server import SimpleHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

PORT = 3000
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), 'frontend')
DATA_FILE = os.path.join(os.path.dirname(__file__), 'backend', 'data', 'tasks.json')

def load_tasks():
    if not os.path.exists(DATA_FILE):
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        with open(DATA_FILE, 'w') as f:
            json.dump([], f)
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

def save_tasks(tasks):
    with open(DATA_FILE, 'w') as f:
        json.dump(tasks, f, indent=2)

class TaskHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=FRONTEND_DIR, **kwargs)

    def _send_response(self, status, data):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_GET(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path == '/api/tasks':
            self._send_response(200, load_tasks())
        elif parsed_path.path.startswith('/api/tasks/'):
            task_id = parsed_path.path.split('/')[-1]
            tasks = load_tasks()
            task = next((t for t in tasks if t['id'] == task_id), None)
            if task:
                self._send_response(200, task)
            else:
                self._send_response(404, {'error': 'Task not found'})
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/tasks':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode()
            data = json.loads(body)
            
            title = data.get('title', '').strip()
            if not title:
                self._send_response(400, {'error': 'Title is required'})
                return
                
            new_task = {
                'id': str(uuid.uuid4()),
                'title': title,
                'description': data.get('description', ''),
                'priority': data.get('priority', 'medium'),
                'completed': False,
                'createdAt': datetime.datetime.utcnow().isoformat() + 'Z'
            }
            tasks = load_tasks()
            tasks.append(new_task)
            save_tasks(tasks)
            self._send_response(201, new_task)
        else:
            self.send_error(404, 'Not found')

    def do_PUT(self):
        if self.path.startswith('/api/tasks/'):
            task_id = self.path.split('/')[-1]
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode()
            updates = json.loads(body)
            
            tasks = load_tasks()
            for idx, task in enumerate(tasks):
                if task['id'] == task_id:
                    tasks[idx].update(updates)
                    tasks[idx]['id'] = task_id # prevent id overwrite
                    save_tasks(tasks)
                    self._send_response(200, tasks[idx])
                    return
            self._send_response(404, {'error': 'Task not found'})
        else:
            self.send_error(404, 'Not found')

    def do_DELETE(self):
        if self.path.startswith('/api/tasks/'):
            task_id = self.path.split('/')[-1]
            tasks = load_tasks()
            initial_len = len(tasks)
            tasks = [t for t in tasks if t['id'] != task_id]
            if len(tasks) < initial_len:
                save_tasks(tasks)
                self.send_response(204)
                self.end_headers()
            else:
                self._send_response(404, {'error': 'Task not found'})
        else:
            self.send_error(404, 'Not found')

if __name__ == '__main__':
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, TaskHandler)
    print(f'\n  TaskFlow Python Server running at http://localhost:{PORT}\n')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        httpd.server_close()
