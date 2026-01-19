/**
 * Socket.io Test Client (Node.js)
 * 
 * This script tests Socket.io functionality from Node.js
 * 
 * Usage:
 *   1. Start server: npm run dev
 *   2. Run this test: node test/test-socket-client.js
 */

const io = require('socket.io-client');

// Configuration
const SERVER_URL = 'http://localhost:3000';
const TEST_TODO = {
    title: 'Test from Node.js Script',
    description: 'Automated Socket.io testing',
    priority: 'high'
};

// Connect to server
console.log('🔌 Connecting to', SERVER_URL);
const socket = io(SERVER_URL);

// Track test todo ID for cleanup
let createdTodoId = null;

// ============================================
// EVENT LISTENERS
// ============================================

/**
 * Connection established
 */
socket.on('connect', () => {
    console.log('✅ Connected to server');
    console.log('   Socket ID:', socket.id);
    console.log('');
    
    // Step 1: Get all existing todos
    console.log('📋 Step 1: Fetching all todos...');
    socket.emit('all');
});

/**
 * User count update
 */
socket.on('count', (data) => {
    console.log('👥 Online users:', data.count);
    console.log('');
});

/**
 * All todos received
 */
socket.on('all', (todos) => {
    console.log('📋 Received todos:', todos.length);
    if (todos.length > 0) {
        console.log('   Latest todo:', todos[0].title);
    }
    console.log('');
    
    // Step 2: Add a test todo
    if (!createdTodoId) {
        console.log('➕ Step 2: Adding test todo...');
        console.log('   Title:', TEST_TODO.title);
        console.log('   Priority:', TEST_TODO.priority);
        socket.emit('add', TEST_TODO);
    }
});

/**
 * Todo added successfully
 */
socket.on('added', (todo) => {
    console.log('✨ Todo created successfully!');
    console.log('   ID:', todo._id);
    console.log('   Title:', todo.title);
    console.log('   Priority:', todo.priority);
    console.log('');
    
    createdTodoId = todo._id;
    
    // Step 3: Update the todo
    console.log('🔄 Step 3: Updating todo...');
    socket.emit('update', {
        id: createdTodoId,
        updates: {
            complete: true,
            description: 'Updated by test script'
        }
    });
});

/**
 * Todo updated successfully
 */
socket.on('updated', (todo) => {
    console.log('✅ Todo updated successfully!');
    console.log('   ID:', todo._id);
    console.log('   Complete:', todo.complete);
    console.log('   Description:', todo.description);
    console.log('');
    
    // Step 4: Delete the todo
    console.log('🗑️  Step 4: Deleting test todo...');
    socket.emit('delete', { id: createdTodoId });
});

/**
 * Todo deleted successfully
 */
socket.on('deleted', (data) => {
    console.log('✅ Todo deleted successfully!');
    console.log('   ID:', data.id);
    console.log('');
    
    // All tests complete
    console.log('🎉 All tests completed successfully!');
    console.log('');
    console.log('Summary:');
    console.log('  ✅ Connected to server');
    console.log('  ✅ Fetched all todos');
    console.log('  ✅ Created new todo');
    console.log('  ✅ Updated todo');
    console.log('  ✅ Deleted todo');
    console.log('');
    console.log('Disconnecting in 2 seconds...');
    
    // Disconnect after 2 seconds
    setTimeout(() => {
        socket.disconnect();
        console.log('👋 Disconnected from server');
        console.log('');
        process.exit(0);
    }, 2000);
});

/**
 * Error occurred
 */
socket.on('error', (error) => {
    console.error('❌ Socket.io Error:', error.message);
    console.error('');
});

/**
 * Connection error
 */
socket.on('connect_error', (error) => {
    console.error('❌ Connection Error:', error.message);
    console.error('');
    console.error('Make sure the server is running:');
    console.error('  npm run dev');
    console.error('');
    process.exit(1);
});

/**
 * Disconnected from server
 */
socket.on('disconnect', (reason) => {
    console.log('❌ Disconnected:', reason);
    console.log('');
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGINT', () => {
    console.log('');
    console.log('⚠️  Interrupted by user');
    if (socket.connected) {
        socket.disconnect();
    }
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('');
    console.log('⚠️  Terminated');
    if (socket.connected) {
        socket.disconnect();
    }
    process.exit(0);
});

// Timeout after 10 seconds
setTimeout(() => {
    console.error('⏰ Test timeout - something went wrong');
    console.error('Check server logs for errors');
    socket.disconnect();
    process.exit(1);
}, 10000);
