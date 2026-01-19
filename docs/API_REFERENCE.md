# API Reference

Complete reference for all API endpoints with examples.

## Base URL
```
http://localhost:3000
```

## Response Format

All responses follow this structure:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "count": 10  // For list endpoints
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "errors": [  // Validation errors
    {
      "msg": "Field is required",
      "param": "field_name",
      "location": "body"
    }
  ]
}
```

---

## Authentication

Currently, authentication is optional. To use authentication middleware:

**Headers:**
```
x-api-key: demo-key-12345
```

---

## Users API

### Get All Users
```http
GET /users
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "first_name": "John",
      "last_name": "Doe",
      "picture": "https://example.com/john.jpg",
      "email": "john@example.com",
      "createdAt": "2026-01-19T10:00:00.000Z",
      "updatedAt": "2026-01-19T10:00:00.000Z"
    }
  ]
}
```

### Get User by ID
```http
GET /users/:userId
```

**Parameters:**
- `userId` (string, required) - MongoDB ObjectId

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "first_name": "John",
    "last_name": "Doe",
    "picture": "https://example.com/john.jpg",
    "email": "john@example.com"
  }
}
```

**Errors:**
- `400` - Invalid ID format
- `404` - User not found

### Create User
```http
POST /users
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "picture": "https://example.com/john.jpg",
  "email": "john@example.com"  // optional
}
```

**Validation Rules:**
- `first_name`: required, 2-50 characters
- `last_name`: required, 2-50 characters
- `picture`: required, valid URL
- `email`: optional, valid email format

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User created successfully",
  "data": { /* created user */ }
}
```

### Update User (Complete Replace)
```http
PUT /users/:userId
```

**Request Body:** (all fields required)
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "picture": "https://example.com/jane.jpg",
  "email": "jane@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": { /* updated user */ }
}
```

### Update User (Partial Update)
```http
PATCH /users/:userId
```

**Request Body:** (only fields to update)
```json
{
  "first_name": "Jane"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": { /* updated user */ }
}
```

### Delete User
```http
DELETE /users/:userId
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": { /* deleted user */ }
}
```

---

## Todos API

### Get All Todos
```http
GET /todos
GET /todos?complete=true
GET /todos?priority=high
```

**Query Parameters:**
- `complete` (boolean, optional) - Filter by completion status
- `priority` (string, optional) - Filter by priority (low, medium, high)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Complete project",
      "description": "Finish the backend API",
      "complete": false,
      "priority": "high",
      "dueDate": "2026-01-25T00:00:00.000Z",
      "createdAt": "2026-01-19T10:00:00.000Z"
    }
  ]
}
```

### Get Todo by ID
```http
GET /todos/:todoId
```

### Create Todo
```http
POST /todos
```

**Request Body:**
```json
{
  "title": "Complete project",
  "description": "Finish the backend API",  // optional
  "complete": false,  // optional, default: false
  "priority": "high",  // optional, default: "medium"
  "dueDate": "2026-01-25T00:00:00.000Z"  // optional
}
```

**Validation Rules:**
- `title`: required, 3-200 characters
- `description`: optional, max 1000 characters
- `complete`: optional, boolean
- `priority`: optional, enum: low, medium, high
- `dueDate`: optional, valid ISO 8601 date

**Response:** `201 Created`

### Update Todo (Complete Replace)
```http
PUT /todos/:todoId
```

**Request Body:** (all required fields)
```json
{
  "title": "Updated title",
  "complete": true,
  "priority": "low"
}
```

### Update Todo (Partial Update)
```http
PATCH /todos/:todoId
```

**Request Body:** (only fields to update)
```json
{
  "complete": true
}
```

### Delete Todo
```http
DELETE /todos/:todoId
```

---

## Assignments API

### Get All Assignments
```http
GET /assignments
GET /assignments?status=pending
```

**Query Parameters:**
- `status` (string, optional) - Filter by status (pending, in-progress, completed, cancelled)

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Backend Development",
      "content": "Build REST API with Express",
      "status": "in-progress",
      "dueDate": "2026-01-30T00:00:00.000Z",
      "submittedDate": null,
      "grade": null,
      "createdAt": "2026-01-19T10:00:00.000Z"
    }
  ]
}
```

### Get Assignment by ID
```http
GET /assignments/:assignmentId
```

### Create Assignment
```http
POST /assignments
```

**Request Body:**
```json
{
  "title": "Backend Development",
  "content": "Build REST API with Express and MongoDB",
  "status": "pending",  // optional, default: "pending"
  "dueDate": "2026-01-30T00:00:00.000Z",
  "submittedDate": "2026-01-29T00:00:00.000Z",  // optional
  "grade": 95  // optional, 0-100
}
```

**Validation Rules:**
- `title`: required, 5-200 characters
- `content`: required, min 10 characters
- `status`: optional, enum: pending, in-progress, completed, cancelled
- `dueDate`: required, valid ISO 8601 date
- `submittedDate`: optional, valid ISO 8601 date
- `grade`: optional, number 0-100

**Response:** `201 Created`

### Update Assignment (Complete Replace)
```http
PUT /assignments/:assignmentId
```

**Request Body:** (all required fields)
```json
{
  "title": "Updated Assignment",
  "content": "Updated content here",
  "dueDate": "2026-02-01T00:00:00.000Z"
}
```

### Update Assignment (Partial Update)
```http
PATCH /assignments/:assignmentId
```

**Request Body:** (only fields to update)
```json
{
  "status": "completed",
  "submittedDate": "2026-01-29T00:00:00.000Z",
  "grade": 95
}
```

### Delete Assignment
```http
DELETE /assignments/:assignmentId
```

---

## Socket.io Events

### Connection
```javascript
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});
```

### Get Connected Users Count
```javascript
socket.on('count', (data) => {
  console.log('Connected users:', data.count);
});
```

### Get All Todos
```javascript
// Emit
socket.emit('all');

// Listen
socket.on('all', (todos) => {
  console.log('All todos:', todos);
});
```

### Add Todo
```javascript
// Emit
socket.emit('add', {
  title: 'New Todo',
  description: 'Description here',
  priority: 'high'
});

// Listen (creator receives this)
socket.on('added', (todo) => {
  console.log('Todo added:', todo);
});

// All other clients also receive 'added' event
```

### Update Todo
```javascript
// Emit
socket.emit('update', {
  id: '507f1f77bcf86cd799439011',
  updates: {
    complete: true,
    title: 'Updated Title'
  }
});

// Listen
socket.on('updated', (todo) => {
  console.log('Todo updated:', todo);
});
```

### Delete Todo
```javascript
// Emit
socket.emit('delete', {
  id: '507f1f77bcf86cd799439011'
});

// Listen
socket.on('deleted', (data) => {
  console.log('Todo deleted, ID:', data.id);
});
```

### Error Handling
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error.message);
});
```

### Disconnect
```javascript
socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

---

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation error, invalid input |
| 401 | Unauthorized | Missing authentication |
| 403 | Forbidden | Invalid authentication |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry (e.g., email) |
| 500 | Server Error | Internal server error |

---

## Rate Limiting

Currently not implemented. Recommended for production:

```javascript
// Future implementation
// 100 requests per 15 minutes per IP
```

---

## Examples with cURL

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

### Get All Todos with Filter
```bash
curl "http://localhost:3000/todos?priority=high&complete=false"
```

### Update Assignment Grade
```bash
curl -X PATCH http://localhost:3000/assignments/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "grade": 95,
    "status": "completed"
  }'
```

### Delete User
```bash
curl -X DELETE http://localhost:3000/users/507f1f77bcf86cd799439011
```

---

## Interactive Documentation

For interactive API testing, visit:
```
http://localhost:3000/swagger
```

This provides:
- ✅ Try-it-out functionality
- ✅ Request/response examples
- ✅ Schema documentation
- ✅ Authentication testing
