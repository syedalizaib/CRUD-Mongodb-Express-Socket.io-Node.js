# Test Files

This folder contains test files for the CRUD API project.

## 📁 Contents

### `test-socketio.html`
**Interactive Socket.io Test Client**

A beautiful, visual web interface for testing Socket.io real-time features.

**How to use:**
```bash
# 1. Start the server
npm run dev

# 2. Open the test file
open test/test-socketio.html
# or double-click the file
```

**Features:**
- ✅ Real-time connection status
- ✅ Add/update/delete todos
- ✅ Live event logging
- ✅ User count tracking
- ✅ Multi-window sync testing

**Pro Tip:** Open in multiple browser windows to see real-time synchronization!

---

## 🧪 Testing Methods

### 1. HTML Client (Easiest)
Use `test-socketio.html` for visual testing with a complete UI.

### 2. Node.js Script
Create a test script (see example below).

### 3. Browser Console
Quick tests using browser developer console.

---

## 📝 Example Node.js Test Script

Create `test-socket-client.js`:

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('✅ Connected:', socket.id);
    socket.emit('all');
});

socket.on('count', (data) => {
    console.log('👥 Online users:', data.count);
});

socket.on('all', (todos) => {
    console.log('📋 Todos:', todos);
    
    // Test: Add a todo
    socket.emit('add', {
        title: 'Test from Node.js',
        description: 'Testing Socket.io',
        priority: 'high'
    });
});

socket.on('added', (todo) => {
    console.log('✨ Todo added:', todo);
    setTimeout(() => {
        socket.disconnect();
        process.exit(0);
    }, 2000);
});

socket.on('error', (error) => {
    console.error('❌ Error:', error);
});
```

**Run:**
```bash
# Install client first (if not already installed)
npm install socket.io-client

# Run test
node test/test-socket-client.js
```

---

## 🔍 What to Test

### Connection Tests
- [ ] Client can connect to server
- [ ] Connection status updates
- [ ] Socket ID is assigned
- [ ] User count increments

### CRUD Operations
- [ ] Get all todos (`all` event)
- [ ] Add new todo (`add` event)
- [ ] Update todo (`update` event)
- [ ] Delete todo (`delete` event)

### Real-time Sync
- [ ] Open 2+ browser windows
- [ ] Add todo in one window
- [ ] Verify it appears in other windows
- [ ] Update/delete syncs across all clients

### Error Handling
- [ ] Invalid todo ID
- [ ] Missing required fields
- [ ] Network disconnect/reconnect

---

## 📚 Documentation

For complete testing guide, see:
- **[../docs/SOCKETIO_TESTING.md](../docs/SOCKETIO_TESTING.md)** - Full testing documentation
- **[../SOCKETIO_SUMMARY.md](../SOCKETIO_SUMMARY.md)** - Quick reference

---

## 🐛 Debugging

**Enable debug logs:**

Browser:
```javascript
localStorage.debug = 'socket.io-client:*';
```

Node.js:
```bash
DEBUG=socket.io:* node test/test-socket-client.js
```

**Check server logs:**
```bash
npm run dev
# Watch for connection/event logs
```

---

## ✅ Quick Test Checklist

```bash
# 1. Start server
npm run dev

# 2. Open HTML test client
open test/test-socketio.html

# 3. Verify connection (green status)
# 4. Add a todo
# 5. Open second window
# 6. Add todo in first window
# 7. Watch it appear in second window instantly! 🎉
```

---

**Need help?** See the main documentation or check server logs for errors.
