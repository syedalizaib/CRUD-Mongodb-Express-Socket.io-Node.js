# Quick Reference Card

Quick reference for common operations and commands.

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Setup environment
cp env.example .env

# Start development server
npm run dev

# Start production server
npm start
```

## 📍 Important URLs

```
API Base:        http://localhost:3000
Swagger Docs:    http://localhost:3000/swagger
Health Check:    http://localhost:3000
API Spec JSON:   http://localhost:3000/swagger.json
```

## 📋 All API Endpoints

### Users
```bash
GET    /users          # Get all users
GET    /users/:id      # Get user by ID
POST   /users          # Create user
PUT    /users/:id      # Update user (full)
PATCH  /users/:id      # Update user (partial)
DELETE /users/:id      # Delete user
```

### Todos
```bash
GET    /todos          # Get all todos
GET    /todos/:id      # Get todo by ID
POST   /todos          # Create todo
PUT    /todos/:id      # Update todo (full)
PATCH  /todos/:id      # Update todo (partial)
DELETE /todos/:id      # Delete todo

# Query Parameters
?complete=true         # Filter by completion
?priority=high         # Filter by priority
```

### Assignments
```bash
GET    /assignments          # Get all assignments
GET    /assignments/:id      # Get assignment by ID
POST   /assignments          # Create assignment
PUT    /assignments/:id      # Update assignment (full)
PATCH  /assignments/:id      # Update assignment (partial)
DELETE /assignments/:id      # Delete assignment

# Query Parameters
?status=pending             # Filter by status
```

## 💬 Socket.io Events

### Client → Server
```javascript
socket.emit('all')                    // Get all todos
socket.emit('add', { title: '...' })  // Add todo
socket.emit('update', { id, updates }) // Update todo
socket.emit('delete', { id })         // Delete todo
```

### Server → Client
```javascript
socket.on('all', (todos) => {...})    // Receive todos
socket.on('added', (todo) => {...})   // Todo added
socket.on('updated', (todo) => {...}) // Todo updated
socket.on('deleted', (data) => {...}) // Todo deleted
socket.on('count', (data) => {...})   // User count
socket.on('error', (err) => {...})    // Error occurred
```

## 🔧 cURL Examples

### Create User
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "picture": "https://example.com/photo.jpg",
    "email": "john@example.com"
  }'
```

### Get All Users
```bash
curl http://localhost:3000/users
```

### Update User (Partial)
```bash
curl -X PATCH http://localhost:3000/users/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{"first_name": "Jane"}'
```

### Create Todo
```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project",
    "description": "Finish the backend API",
    "priority": "high",
    "complete": false
  }'
```

### Filter Todos
```bash
curl "http://localhost:3000/todos?priority=high&complete=false"
```

### Delete Assignment
```bash
curl -X DELETE http://localhost:3000/assignments/507f1f77bcf86cd799439011
```

## 📝 Request Body Templates

### User (POST/PUT)
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "picture": "https://example.com/photo.jpg",
  "email": "john@example.com"
}
```

### Todo (POST/PUT)
```json
{
  "title": "Complete project",
  "description": "Finish the backend API",
  "complete": false,
  "priority": "high",
  "dueDate": "2026-01-25T00:00:00.000Z"
}
```

### Assignment (POST/PUT)
```json
{
  "title": "Backend Development",
  "content": "Build REST API with Express and MongoDB",
  "status": "pending",
  "dueDate": "2026-01-30T00:00:00.000Z",
  "submittedDate": "2026-01-29T00:00:00.000Z",
  "grade": 95
}
```

## ✅ Validation Rules Quick Reference

### Users
- `first_name`: required, 2-50 chars
- `last_name`: required, 2-50 chars
- `picture`: required, string
- `email`: optional, valid email

### Todos
- `title`: required, 3-200 chars
- `description`: optional, max 1000 chars
- `complete`: optional, boolean
- `priority`: optional, low/medium/high
- `dueDate`: optional, ISO 8601 date

### Assignments
- `title`: required, 5-200 chars
- `content`: required, min 10 chars
- `status`: optional, pending/in-progress/completed/cancelled
- `dueDate`: required, ISO 8601 date
- `grade`: optional, 0-100

## 🔄 HTTP Status Codes

```
200  OK                  - Successful GET, PUT, PATCH, DELETE
201  Created             - Successful POST
400  Bad Request         - Validation error
401  Unauthorized        - Missing authentication
403  Forbidden           - Invalid authentication
404  Not Found           - Resource doesn't exist
409  Conflict            - Duplicate entry
500  Internal Error      - Server error
```

## 📦 Response Formats

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* resource */ },
  "count": 10  // for lists
}
```

### Error
```json
{
  "success": false,
  "error": "Error message",
  "errors": [  // validation errors
    {
      "msg": "Field is required",
      "param": "field_name",
      "location": "body"
    }
  ]
}
```

## ⚙️ Environment Variables

```env
PORT=3000
NODE_ENV=development
DB_CONNECTION=mongodb://localhost:27017/crud-api
CORS_ORIGIN=*
API_KEY=demo-key-12345
```

## 🗂️ Project Structure

```
├── app.js              # Main entry point
├── config/             # Configuration
│   └── swagger.js
├── middleware/         # Custom middleware
│   ├── auth.js
│   ├── errorHandler.js
│   ├── logger.js
│   └── notFound.js
├── models/             # Mongoose schemas
│   ├── users.js
│   ├── todos.js
│   └── assignments.js
├── routes/             # API endpoints
│   ├── users.js
│   ├── todos.js
│   └── assignments.js
└── docs/               # Documentation
```

## 🔌 Socket.io Connection Example

```javascript
// Client-side
const socket = io('http://localhost:3000');

// Connection events
socket.on('connect', () => console.log('Connected'));
socket.on('disconnect', () => console.log('Disconnected'));

// Get all todos
socket.emit('all');
socket.on('all', (todos) => console.log(todos));

// Add todo
socket.emit('add', {
  title: 'New Task',
  priority: 'high'
});
socket.on('added', (todo) => console.log('Added:', todo));
```

## 🐛 Debugging

### Check Server Status
```bash
# Check if running
curl http://localhost:3000

# Check specific endpoint
curl http://localhost:3000/users
```

### View Logs
```bash
# Start with logs visible
npm run dev

# Watch for:
# ✓ MongoDB connected successfully
# ✓ Server running on port 3000
# [timestamp] GET /users - Status: 200
```

### Common Issues

**MongoDB connection error:**
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB (Mac)
brew services start mongodb-community

# Start MongoDB (Linux)
sudo systemctl start mongod
```

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

## 📚 Documentation Files

```
README.md                    - Project overview
docs/UPDATE_SUMMARY.md       - What was updated
docs/INDEX.md                - Documentation index
docs/SETUP_GUIDE.md          - Installation guide
docs/API_REFERENCE.md        - Complete API docs
docs/PROJECT_STRUCTURE.md    - Architecture
docs/LIBRARIES.md            - Tech stack
docs/BEST_PRACTICES.md       - Coding standards
docs/ARCHITECTURE_DIAGRAMS.md - Visual diagrams
```

## 🧪 Testing Tools

### Browser
```
Visit: http://localhost:3000/swagger
Use "Try it out" to test endpoints
```

### Postman
```
Import: http://localhost:3000/swagger.json
Test all endpoints interactively
```

### cURL
```
See examples above
```

### JavaScript/Node
```javascript
const response = await fetch('http://localhost:3000/users');
const data = await response.json();
```

## 🚀 Deployment Checklist

- [ ] Set NODE_ENV=production
- [ ] Configure production MongoDB
- [ ] Set specific CORS origins
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Set up logging
- [ ] Configure PM2
- [ ] Set up monitoring
- [ ] Enable database backups

## 📞 Quick Help

**Need help?**
1. Check Swagger docs: http://localhost:3000/swagger
2. Read docs/SETUP_GUIDE.md for installation issues
3. Review docs/API_REFERENCE.md for endpoint details
4. Check terminal logs for error messages

---

**Version**: 2.0.0  
**Updated**: January 2026  
**Node**: >=18.0.0
