# Socket.io Testing Guide

Complete guide to testing Socket.io real-time features.

## 📋 Implemented Socket.io Features

### Client → Server Events

| Event | Data | Description |
|-------|------|-------------|
| `all` | none | Request all todos |
| `add` | `{ title, description, priority }` | Create new todo |
| `update` | `{ id, updates: {...} }` | Update existing todo |
| `delete` | `{ id }` | Delete todo |

### Server → Client Events

| Event | Data | Description |
|-------|------|-------------|
| `count` | `{ count }` | Connected users count |
| `all` | `[todos...]` | All todos response |
| `added` | `todo` | Todo created (broadcast to all) |
| `updated` | `todo` | Todo updated (broadcast to all) |
| `deleted` | `{ id }` | Todo deleted (broadcast to all) |
| `error` | `{ message }` | Error occurred |

---

## 🧪 Testing Methods

### ⭐ Method 1: HTML Test Client (Easiest)

**File:** `test/test-socketio.html`

**Steps:**
1. Start your server:
   ```bash
   npm run dev
   ```

2. Open `test/test-socketio.html` in your browser
   - Double-click the file, or
   - Open with: `open test/test-socketio.html` (Mac)
   - Open with: `start test/test-socketio.html` (Windows)

3. You should see:
   - ✅ Connection status (green = connected)
   - Socket ID displayed
   - Online users count
   - Forms to add/update/delete todos
   - Live event log

**Features:**
- Visual UI for all Socket.io operations
- Real-time event logging
- Todo list display
- Add, update, delete todos
- See live updates from other clients

**Test Real-time Updates:**
1. Open the HTML file in **two different browser windows**
2. Add a todo in one window
3. Watch it appear in both windows instantly! 🎉

---

### Method 2: Browser Console

Open browser console and paste:

```javascript
// Load Socket.io client
const script = document.createElement('script');
script.src = 'https://cdn.socket.io/4.7.4/socket.io.min.js';
document.head.appendChild(script);

script.onload = () => {
    // Connect to server
    const socket = io('http://localhost:3000');

    // Listen to events
    socket.on('connect', () => {
        console.log('✅ Connected:', socket.id);
    });

    socket.on('count', (data) => {
        console.log('👥 Online users:', data.count);
    });

    socket.on('all', (todos) => {
        console.log('📋 All todos:', todos);
    });

    socket.on('added', (todo) => {
        console.log('✨ Todo added:', todo);
    });

    socket.on('updated', (todo) => {
        console.log('🔄 Todo updated:', todo);
    });

    socket.on('deleted', (data) => {
        console.log('🗑️ Todo deleted:', data.id);
    });

    // Make socket available globally
    window.socket = socket;
};
```

**Then test commands:**

```javascript
// Get all todos
socket.emit('all');

// Add a todo
socket.emit('add', {
    title: 'Test from console',
    description: 'Testing Socket.io',
    priority: 'high'
});

// Update a todo (replace with actual ID)
socket.emit('update', {
    id: '507f1f77bcf86cd799439011',
    updates: { complete: true }
});

// Delete a todo (replace with actual ID)
socket.emit('delete', {
    id: '507f1f77bcf86cd799439011'
});
```

---

### Method 3: Node.js Script

**File:** `test/test-socket-client.js` (already created for you!)

**Quick Run:**
```bash
npm run dev           # Terminal 1: Start server
node test/test-socket-client.js  # Terminal 2: Run test
```

**Or create your own** `test-socket-client.js`:

```javascript
const io = require('socket.io-client');

// Connect to server
const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('✅ Connected:', socket.id);
    
    // Get all todos
    socket.emit('all');
});

socket.on('count', (data) => {
    console.log('👥 Online users:', data.count);
});

socket.on('all', (todos) => {
    console.log('📋 All todos:', todos);
    
    // Add a test todo
    socket.emit('add', {
        title: 'Test from Node.js',
        description: 'Testing Socket.io from Node',
        priority: 'medium'
    });
});

socket.on('added', (todo) => {
    console.log('✨ Todo added:', todo);
    
    // Update it
    socket.emit('update', {
        id: todo._id,
        updates: { complete: true }
    });
});

socket.on('updated', (todo) => {
    console.log('🔄 Todo updated:', todo);
    
    // Delete it
    socket.emit('delete', { id: todo._id });
});

socket.on('deleted', (data) => {
    console.log('🗑️ Todo deleted:', data.id);
    
    // Disconnect after 2 seconds
    setTimeout(() => {
        socket.disconnect();
        console.log('👋 Disconnected');
        process.exit(0);
    }, 2000);
});

socket.on('error', (error) => {
    console.error('❌ Error:', error);
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected from server');
});
```

**Run:**
```bash
# Install socket.io-client first
npm install socket.io-client

# Run test
node test-socket-client.js
```

---

### Method 4: Socket.io Admin UI

Install and use the official Socket.io admin UI:

```bash
npm install @socket.io/admin-ui
```

Add to `app.js`:
```javascript
const { instrument } = require('@socket.io/admin-ui');

instrument(io, {
  auth: false, // or configure authentication
  mode: 'development'
});
```

Access at: `http://localhost:3000/admin`

---

### Method 5: Chrome Extension

**Extension:** "Socket.io Client Tool"

1. Install from Chrome Web Store
2. Open extension
3. Connect to `http://localhost:3000`
4. Send/receive events through UI

---

## 🔧 Testing Tools Comparison

| Tool | Difficulty | Features | Best For |
|------|-----------|----------|----------|
| **HTML Test Client** ⭐ | Easy | Full UI, Visual | Quick testing, demos |
| **Browser Console** | Easy | Quick tests | Development debugging |
| **Node.js Script** | Medium | Automated | Integration tests |
| **Socket.io Admin UI** | Medium | Monitoring | Production monitoring |
| **Chrome Extension** | Easy | UI-based | Manual testing |

---

## ❌ Why Not Postman?

**Postman doesn't support Socket.io because:**

1. **Different Protocol**
   - Postman: HTTP/REST
   - Socket.io: WebSocket + custom protocol

2. **Handshake Process**
   - Socket.io uses special handshake
   - Postman's WebSocket doesn't support this

3. **Event System**
   - Socket.io uses named events
   - Basic WebSocket uses messages only

**Alternative:** Postman can test the REST API endpoints (`/users`, `/todos`, `/assignments`), which is what it's designed for.

---

## 📝 Example Test Scenarios

### Scenario 1: Basic CRUD Operations

```javascript
// 1. Connect
socket.emit('all'); // Get existing todos

// 2. Create
socket.emit('add', {
    title: 'Learn Socket.io',
    priority: 'high'
});

// 3. Update (use ID from 'added' event)
socket.emit('update', {
    id: 'received_id_here',
    updates: { complete: true }
});

// 4. Delete
socket.emit('delete', { id: 'received_id_here' });
```

### Scenario 2: Real-time Sync Test

**Steps:**
1. Open HTML test client in 2 browser windows
2. Add todo in window 1
3. Verify it appears in window 2 instantly
4. Update in window 2
5. Verify update in window 1
6. Check user count updates

### Scenario 3: Error Handling

```javascript
// Test invalid ID
socket.emit('update', {
    id: 'invalid_id',
    updates: { title: 'New' }
});

// Listen for error
socket.on('error', (err) => {
    console.log('Expected error:', err);
});
```

### Scenario 4: Connection/Disconnection

```javascript
// Monitor connection status
socket.on('connect', () => console.log('Connected'));
socket.on('disconnect', () => console.log('Disconnected'));

// Force disconnect
socket.disconnect();

// Reconnect
socket.connect();
```

---

## 🐛 Debugging Tips

### Check Server Logs

When testing, watch server terminal for:
```
✓ User connected: socket_id | Total users: 1
✓ Todo created: Todo Title
✓ Todo updated: Todo Title
✓ Todo deleted: Todo Title
✗ User disconnected
```

### Common Issues

**1. Can't connect**
- ✅ Is server running? (`npm run dev`)
- ✅ Correct URL? (`http://localhost:3000`)
- ✅ CORS enabled? (Check `app.js`)

**2. Events not received**
- ✅ Listening to correct event names?
- ✅ Check server logs for errors
- ✅ Try `socket.emit('all')` first

**3. Connection drops**
- ✅ Check network/firewall
- ✅ Server still running?
- ✅ Check browser console for errors

### Enable Debug Mode

In HTML client:
```javascript
localStorage.debug = 'socket.io-client:*';
```

In Node.js:
```bash
DEBUG=socket.io:* node your-script.js
```

---

## 📊 Monitoring

### See Connected Clients

Add to `app.js`:
```javascript
// Get number of connected clients
console.log('Connected clients:', io.engine.clientsCount);

// Get all socket IDs
io.sockets.sockets.forEach((socket) => {
    console.log('Socket ID:', socket.id);
});
```

### Track Events

```javascript
io.on('connection', (socket) => {
    // Log all events
    socket.onAny((eventName, ...args) => {
        console.log(`Event: ${eventName}`, args);
    });
});
```

---

## 🎯 Quick Start Commands

```bash
# 1. Start server
npm run dev

# 2. Open HTML test client
open test/test-socketio.html

# 3. Test in browser console
# (Use Method 2 code above)

# 4. Test with Node.js
node test-socket-client.js
```

---

## 📚 Additional Resources

- **Socket.io Docs**: https://socket.io/docs/v4/
- **Socket.io Client API**: https://socket.io/docs/v4/client-api/
- **Debugging Guide**: https://socket.io/docs/v4/troubleshooting-connection-issues/

---

## ✅ Testing Checklist

Use this checklist to verify Socket.io functionality:

- [ ] Server starts without errors
- [ ] Client can connect
- [ ] Connection status updates
- [ ] User count updates correctly
- [ ] Can get all todos
- [ ] Can add new todo
- [ ] Todo appears in real-time
- [ ] Can update todo
- [ ] Update broadcasts to all clients
- [ ] Can delete todo
- [ ] Delete broadcasts to all clients
- [ ] Errors are handled gracefully
- [ ] Disconnection works properly
- [ ] Reconnection works
- [ ] Multiple clients see same data

---

**Happy Testing! 🎉**
