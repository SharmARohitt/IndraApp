// Mock backend server for testing INDRA Mobile app
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Mock data
const tasks = [
  {
    id: 'task1',
    substationId: 'sub1',
    substationName: 'Substation Alpha - 400kV',
    lat: 20.5937,
    lng: 78.9629,
    status: 'assigned',
    priority: 'high',
    assignedAt: new Date().toISOString(),
    description: 'Routine inspection of transformer and circuit breakers. Check oil levels and SF6 pressure.',
    checklist: [
      { id: 'c1', label: 'Check transformer oil level', checked: false, required: true },
      { id: 'c2', label: 'Inspect breaker condition', checked: false, required: true },
      { id: 'c3', label: 'Measure SF6 pressure', checked: false, required: true },
      { id: 'c4', label: 'Check cooling system', checked: false, required: false },
      { id: 'c5', label: 'Inspect busbar connections', checked: false, required: false },
    ],
  },
  {
    id: 'task2',
    substationId: 'sub2',
    substationName: 'Substation Beta - 220kV',
    lat: 20.6,
    lng: 78.98,
    status: 'urgent',
    priority: 'urgent',
    assignedAt: new Date(Date.now() - 3600000).toISOString(),
    description: 'URGENT: Investigate reported abnormal noise from transformer. Immediate inspection required.',
    checklist: [
      { id: 'c1', label: 'Identify noise source', checked: false, required: true },
      { id: 'c2', label: 'Check transformer temperature', checked: false, required: true },
      { id: 'c3', label: 'Inspect for oil leaks', checked: false, required: true },
    ],
  },
  {
    id: 'task3',
    substationId: 'sub3',
    substationName: 'Substation Gamma - 400kV',
    lat: 20.58,
    lng: 78.95,
    status: 'assigned',
    priority: 'medium',
    assignedAt: new Date(Date.now() - 7200000).toISOString(),
    description: 'Monthly maintenance check. Standard inspection protocol.',
    checklist: [
      { id: 'c1', label: 'Visual inspection', checked: false, required: true },
      { id: 'c2', label: 'Check protection relays', checked: false, required: true },
      { id: 'c3', label: 'Test emergency systems', checked: false, required: false },
    ],
  },
];

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple mock authentication
  if (email && password) {
    res.json({
      user: {
        id: 'worker1',
        name: 'John Worker',
        email: email,
        role: 'worker',
      },
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

app.post('/api/auth/refresh', (req, res) => {
  res.json({
    accessToken: 'mock-access-token-' + Date.now(),
  });
});

// Task endpoints
app.get('/api/worker/tasks', (req, res) => {
  console.log('Fetching tasks...');
  res.json(tasks);
});

app.get('/api/worker/tasks/:taskId', (req, res) => {
  const task = tasks.find((t) => t.id === req.params.taskId);
  if (task) {
    res.json(task);
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
});

app.patch('/api/worker/tasks/:taskId/status', (req, res) => {
  const task = tasks.find((t) => t.id === req.params.taskId);
  if (task) {
    task.status = req.body.status;
    console.log(`Task ${req.params.taskId} status updated to ${req.body.status}`);
    
    // Broadcast update to all connected clients
    io.emit('task:updated', {
      taskId: req.params.taskId,
      changes: { status: req.body.status },
    });
    
    res.json({ success: true });
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
});

// Report submission
app.post('/api/worker/reports', upload.fields([
  { name: 'photos', maxCount: 10 },
  { name: 'videos', maxCount: 5 },
]), (req, res) => {
  console.log('Report received:');
  console.log('- Task ID:', req.body.taskId);
  console.log('- Severity:', req.body.severity);
  console.log('- Notes:', req.body.notes);
  console.log('- Photos:', req.files?.photos?.length || 0);
  console.log('- Videos:', req.files?.videos?.length || 0);
  console.log('- Checklist:', req.body.checklistData);
  
  res.json({
    success: true,
    reportId: 'report_' + Date.now(),
  });
});

// Push notification registration
app.post('/api/worker/register-device', (req, res) => {
  console.log('Push token registered:', req.body.pushToken);
  res.json({ success: true });
});

// Logging endpoint
app.post('/api/logs', (req, res) => {
  console.log('[CLIENT LOG]', req.body.level.toUpperCase(), ':', req.body.message);
  if (req.body.data) {
    console.log('Data:', req.body.data);
  }
  res.json({ success: true });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Worker connected:', socket.id);
  
  // Send welcome message
  socket.emit('connected', { message: 'Connected to INDRA server' });
  
  // Simulate new task assignment after 30 seconds
  setTimeout(() => {
    const newTask = {
      id: 'task_' + Date.now(),
      substationId: 'sub_new',
      substationName: 'Substation Delta - 220kV',
      lat: 20.61,
      lng: 78.97,
      status: 'assigned',
      priority: 'high',
      assignedAt: new Date().toISOString(),
      description: 'New task assigned via real-time notification',
      checklist: [
        { id: 'c1', label: 'Perform inspection', checked: false, required: true },
      ],
    };
    
    socket.emit('task:assigned', newTask);
    console.log('New task assigned to worker:', socket.id);
  }, 30000);
  
  socket.on('disconnect', () => {
    console.log('Worker disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 INDRA Mock Server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Update your .env file with: API_BASE_URL=http://YOUR_IP:${PORT}/api`);
  console.log(`🔌 WebSocket URL: ws://YOUR_IP:${PORT}\n`);
});
