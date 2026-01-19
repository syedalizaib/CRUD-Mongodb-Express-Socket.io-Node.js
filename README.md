# CRUD API - MongoDB + Express + Socket.io + Node.js

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/express-4.19.2-blue)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/mongodb-compatible-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-ISC-blue)](LICENSE)

A modern, full-featured REST API demonstrating CRUD operations with MongoDB, Express.js, Socket.io, and Node.js. Built with best practices, comprehensive validation, real-time features, and complete API documentation.

## ✨ Features

- ✅ **Full CRUD Operations** - GET, POST, PUT, PATCH, DELETE
- ✅ **MongoDB Integration** - Mongoose ODM with schema validation
- ✅ **Real-time Updates** - Socket.io for live data synchronization
- ✅ **Input Validation** - Express-validator for all endpoints
- ✅ **API Documentation** - Interactive Swagger/OpenAPI docs
- ✅ **Error Handling** - Centralized error management
- ✅ **CORS Support** - Cross-origin resource sharing
- ✅ **Custom Middleware** - Authentication, logging, error handling
- ✅ **Modern JavaScript** - ES6+ with async/await
- ✅ **Graceful Shutdown** - Proper cleanup and termination

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **MongoDB** >= 5.0 (local or Atlas)
- **npm** >= 9.0.0

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd CRUD-Mongodb-Express-Socket.io-Node.js

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env with your configuration
# At minimum, set DB_CONNECTION to your MongoDB URL

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000`

## 📚 Documentation

Complete documentation is available in the `/docs` folder:

- **[Setup Guide](./docs/SETUP_GUIDE.md)** - Detailed installation and configuration
- **[API Reference](./docs/API_REFERENCE.md)** - Complete endpoint documentation with examples
- **[Project Structure](./docs/PROJECT_STRUCTURE.md)** - Architecture and organization
- **[Libraries Used](./docs/LIBRARIES.md)** - Detailed explanation of all dependencies
- **[Best Practices](./docs/BEST_PRACTICES.md)** - Coding standards and patterns

### Interactive API Documentation

Visit `http://localhost:3000/swagger` for interactive Swagger documentation where you can:
- 📖 Browse all endpoints
- 🧪 Test API calls directly
- 📋 View request/response schemas
- 🔍 Explore data models

## 🛠️ Tech Stack

### Core Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| [Express](https://expressjs.com/) | 4.19.2 | Web framework |
| [Mongoose](https://mongoosejs.com/) | 8.1.1 | MongoDB ODM |
| [Socket.io](https://socket.io/) | 4.7.4 | Real-time communication |
| [Express Validator](https://express-validator.github.io/) | 7.0.1 | Input validation |
| [CORS](https://github.com/expressjs/cors) | 2.8.5 | Cross-origin support |
| [Swagger JSDoc](https://github.com/Surnet/swagger-jsdoc) | 6.2.8 | API documentation |
| [Dotenv](https://github.com/motdotla/dotenv) | 16.4.5 | Environment config |

## 📋 API Endpoints

### Users
```
GET    /users          - Get all users
GET    /users/:id      - Get user by ID
POST   /users          - Create new user
PUT    /users/:id      - Update user (complete)
PATCH  /users/:id      - Update user (partial)
DELETE /users/:id      - Delete user
```

### Todos
```
GET    /todos          - Get all todos (with filters)
GET    /todos/:id      - Get todo by ID
POST   /todos          - Create new todo
PUT    /todos/:id      - Update todo (complete)
PATCH  /todos/:id      - Update todo (partial)
DELETE /todos/:id      - Delete todo
```

### Assignments
```
GET    /assignments          - Get all assignments (with filters)
GET    /assignments/:id      - Get assignment by ID
POST   /assignments          - Create new assignment
PUT    /assignments/:id      - Update assignment (complete)
PATCH  /assignments/:id      - Update assignment (partial)
DELETE /assignments/:id      - Delete assignment
```

## 🔌 Socket.io Events

Real-time events for todo management:

```javascript
// Client-side example
const socket = io('http://localhost:3000');

// Get all todos
socket.emit('all');
socket.on('all', (todos) => console.log(todos));

// Add todo
socket.emit('add', { title: 'New Todo', priority: 'high' });
socket.on('added', (todo) => console.log('Todo created:', todo));

// Update todo
socket.emit('update', { id: 'todoId', updates: { complete: true } });
socket.on('updated', (todo) => console.log('Todo updated:', todo));

// Delete todo
socket.emit('delete', { id: 'todoId' });
socket.on('deleted', (data) => console.log('Todo deleted:', data.id));

// User count
socket.on('count', (data) => console.log('Users online:', data.count));
```

## 🔐 Validation Examples

All endpoints include comprehensive validation:

### POST /users
```json
{
  "first_name": "John",      // Required, 2-50 chars
  "last_name": "Doe",        // Required, 2-50 chars
  "picture": "url",          // Required
  "email": "john@test.com"   // Optional, valid email
}
```

### POST /todos
```json
{
  "title": "Task",           // Required, 3-200 chars
  "description": "Details",  // Optional, max 1000 chars
  "complete": false,         // Optional, boolean
  "priority": "high",        // Optional: low, medium, high
  "dueDate": "2026-01-25"    // Optional, ISO 8601 date
}
```

## 🗂️ Project Structure

```
├── app.js                 # Main application entry
├── package.json           # Dependencies & scripts
├── env.example            # Environment template
├── config/
│   └── swagger.js        # API documentation config
├── models/               # Mongoose schemas
│   ├── users.js
│   ├── todos.js
│   └── assignments.js
├── routes/               # Express routes
│   ├── users.js
│   ├── todos.js
│   └── assignments.js
├── middleware/           # Custom middleware
│   ├── auth.js          # Authentication
│   ├── errorHandler.js  # Error handling
│   ├── logger.js        # Request logging
│   └── notFound.js      # 404 handler
└── docs/                # Documentation
    ├── PROJECT_STRUCTURE.md
    ├── API_REFERENCE.md
    ├── LIBRARIES.md
    ├── SETUP_GUIDE.md
    └── BEST_PRACTICES.md
```

## 🔧 Environment Variables

Create a `.env` file (see `env.example`):

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_CONNECTION=mongodb://localhost:27017/crud-api

# CORS
CORS_ORIGIN=*

# Authentication (optional)
API_KEY=demo-key-12345
```

## 📝 Usage Examples

### cURL Examples

```bash
# Get all users
curl http://localhost:3000/users

# Create user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"first_name":"John","last_name":"Doe","picture":"url"}'

# Update user (partial)
curl -X PATCH http://localhost:3000/users/{id} \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Jane"}'

# Delete user
curl -X DELETE http://localhost:3000/users/{id}
```

### JavaScript Fetch Examples

```javascript
// Get all todos with filters
const todos = await fetch('http://localhost:3000/todos?priority=high&complete=false')
  .then(res => res.json());

// Create todo
const newTodo = await fetch('http://localhost:3000/todos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Complete project',
    description: 'Finish the API',
    priority: 'high'
  })
}).then(res => res.json());

// Update assignment grade
const updated = await fetch(`http://localhost:3000/assignments/${id}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ grade: 95, status: 'completed' })
}).then(res => res.json());
```

## 🧪 Testing

### Manual Testing
1. Start the server: `npm run dev`
2. Visit Swagger docs: `http://localhost:3000/swagger`
3. Use "Try it out" feature to test endpoints

### Using Postman
1. Import collection from: `http://localhost:3000/swagger.json`
2. Test all endpoints interactively

## 🚦 Scripts

```bash
npm start       # Start production server
npm run dev     # Start development server with nodemon
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* result */ },
  "count": 10  // for list endpoints
}
```

### Error Response
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

## 🔒 Security Features

- ✅ CORS configuration
- ✅ Input validation and sanitization
- ✅ Error message sanitization
- ✅ Environment variable protection
- ✅ MongoDB injection prevention (via Mongoose)

### Future Security Enhancements
- [ ] Rate limiting
- [ ] JWT authentication
- [ ] Helmet security headers
- [ ] Request encryption (HTTPS)
- [ ] API key rotation

## 🎯 Learning Topics Covered

This project demonstrates:

### Express.js
- ✅ HTTP methods: GET, POST, PUT, PATCH, DELETE
- ✅ Request/Response objects
- ✅ Middleware (custom & third-party)
- ✅ Routing and route parameters
- ✅ Error handling

### Validation
- ✅ Express-validator integration
- ✅ Request body validation
- ✅ URL parameter validation
- ✅ Query string validation
- ✅ Custom validation rules

### Database (Mongoose)
- ✅ Schema definition with constraints
- ✅ Data validation at model level
- ✅ CRUD operations
- ✅ Timestamps
- ✅ Error handling

### Real-time (Socket.io)
- ✅ WebSocket connections
- ✅ Event emitting and listening
- ✅ Broadcasting to clients
- ✅ Connection tracking

### Best Practices
- ✅ Separation of concerns
- ✅ Environment configuration
- ✅ API documentation
- ✅ Consistent error handling
- ✅ Input validation
- ✅ Proper HTTP status codes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Built as a learning project demonstrating modern backend development
- Updated from 2020 version with latest dependencies and best practices
- Comprehensive documentation for educational purposes

## 📧 Support

For detailed documentation, see the `/docs` folder.

For issues or questions:
- Check the [Setup Guide](./docs/SETUP_GUIDE.md)
- Review [API Reference](./docs/API_REFERENCE.md)
- Consult [Best Practices](./docs/BEST_PRACTICES.md)

---

**Last Updated**: January 2026  
**Version**: 2.0.0  
**Node.js**: >=18.0.0  
**MongoDB**: >=5.0.0
