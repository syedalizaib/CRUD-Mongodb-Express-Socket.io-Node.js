# Libraries and Dependencies

This document provides an overview of all libraries used in the project and their purposes.

## Core Dependencies

### 1. **Express** (v4.19.2)
- **Purpose**: Web application framework for Node.js
- **Why**: Fast, minimalist, and most popular Node.js framework
- **Documentation**: https://expressjs.com/

**Key Features Used:**
- Routing
- Middleware support
- HTTP utilities
- Static file serving

**Example:**
```javascript
const express = require('express');
const app = express();

app.get('/users', (req, res) => {
  res.json({ success: true });
});
```

---

### 2. **Mongoose** (v8.1.1)
- **Purpose**: MongoDB object modeling for Node.js
- **Why**: Elegant MongoDB object modeling with built-in validation
- **Documentation**: https://mongoosejs.com/

**Key Features Used:**
- Schema definition with validation
- Model methods (find, findById, save, update, delete)
- Middleware hooks
- Timestamps
- Data type validation

**Example:**
```javascript
const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    minlength: 2
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
```

---

### 3. **Socket.io** (v4.7.4)
- **Purpose**: Real-time bidirectional event-based communication
- **Why**: Enable live updates across connected clients
- **Documentation**: https://socket.io/

**Key Features Used:**
- WebSocket connections
- Event emitting and broadcasting
- Room support
- Automatic reconnection

**Use Cases in Project:**
- Real-time todo updates
- User connection tracking
- Live notifications

**Example:**
```javascript
io.on('connection', (socket) => {
  socket.on('add', async (data) => {
    const todo = await Todo.create(data);
    socket.emit('added', todo);
    socket.broadcast.emit('added', todo);
  });
});
```

---

### 4. **CORS** (v2.8.5)
- **Purpose**: Enable Cross-Origin Resource Sharing
- **Why**: Allow frontend applications on different domains to access the API
- **Documentation**: https://github.com/expressjs/cors

**Configuration:**
```javascript
const corsOptions = {
  origin: '*', // or specific domain
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
};
app.use(cors(corsOptions));
```

---

### 5. **Express Validator** (v7.0.1)
- **Purpose**: Middleware for request validation and sanitization
- **Why**: Validate and sanitize user input before processing
- **Documentation**: https://express-validator.github.io/

**Key Features Used:**
- Field validation (body, params, query)
- Custom validation rules
- Error formatting
- Data sanitization

**Example:**
```javascript
const { body, validationResult } = require('express-validator');

router.post('/users',
  body('email').isEmail().normalizeEmail(),
  body('first_name').trim().isLength({ min: 2 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process request...
  }
);
```

---

### 6. **Dotenv** (v16.4.5)
- **Purpose**: Load environment variables from .env file
- **Why**: Keep sensitive configuration out of code
- **Documentation**: https://github.com/motdotla/dotenv

**Usage:**
```javascript
require('dotenv').config();

const dbUrl = process.env.DB_CONNECTION;
const port = process.env.PORT || 3000;
```

---

### 7. **Swagger JSDoc** (v6.2.8)
- **Purpose**: Generate OpenAPI/Swagger documentation from JSDoc comments
- **Why**: Auto-generate API documentation from code comments
- **Documentation**: https://github.com/Surnet/swagger-jsdoc

**Example:**
```javascript
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/users', handler);
```

---

### 8. **Swagger UI Express** (v5.0.0)
- **Purpose**: Serve Swagger UI for API documentation
- **Why**: Interactive API documentation interface
- **Documentation**: https://github.com/scottie1984/swagger-ui-express

**Features:**
- Interactive API testing
- Request/response examples
- Schema visualization
- Try-it-out functionality

---

## Development Dependencies

### 9. **Nodemon** (v3.0.3)
- **Purpose**: Auto-restart server on file changes
- **Why**: Improves development workflow
- **Documentation**: https://nodemon.io/

**Usage:**
```json
{
  "scripts": {
    "dev": "nodemon app.js"
  }
}
```

---

## Built-in Node.js Modules

### 10. **HTTP**
- **Purpose**: Create HTTP server
- **Why**: Required for Socket.io integration with Express

```javascript
const http = require('http');
const server = http.createServer(app);
```

---

## Removed/Replaced Dependencies

### Body Parser (Removed)
- **Status**: No longer needed
- **Reason**: Built into Express 4.16+ as `express.json()` and `express.urlencoded()`

---

## Comparison with Alternatives

### Why Express over alternatives?
- **Koa**: Express has larger ecosystem and better documentation
- **Fastify**: Express has more middleware options and wider adoption
- **NestJS**: Express is lighter and simpler for this project scope

### Why Mongoose over alternatives?
- **Native MongoDB Driver**: Mongoose provides schema validation and easier syntax
- **Prisma**: Mongoose is better for flexible MongoDB schemas
- **TypeORM**: Mongoose is MongoDB-specific with better features

### Why Socket.io over alternatives?
- **Native WebSockets**: Socket.io handles fallbacks and reconnection
- **ws library**: Socket.io provides rooms and broadcasting
- **Server-Sent Events**: Socket.io is bidirectional

---

## Dependency Management

### Installation
```bash
npm install
```

### Update Dependencies
```bash
# Check outdated packages
npm outdated

# Update all dependencies
npm update

# Update to latest versions
npm install <package>@latest
```

### Security Auditing
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix
```

---

## Version Requirements

**Node.js**: >= 18.0.0
**NPM**: >= 9.0.0

These are specified in `package.json`:
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

---

## Performance Considerations

### Small Impact
- Express: Minimal overhead
- Mongoose: Slight overhead for schema validation
- CORS: Negligible impact

### Moderate Impact
- Express-validator: Runs on each request
- Socket.io: Maintains persistent connections

### Optimization Tips
1. Use lean() queries in Mongoose for read-only data
2. Implement caching for frequently accessed data
3. Use connection pooling for MongoDB
4. Implement rate limiting (express-rate-limit)
5. Compress responses (compression middleware)

---

## Future Library Additions

Consider adding these for production:

1. **helmet** - Security headers
2. **express-rate-limit** - Rate limiting
3. **compression** - Response compression
4. **winston** - Advanced logging
5. **joi** - Alternative validation
6. **jsonwebtoken** - JWT authentication
7. **bcrypt** - Password hashing
8. **redis** - Caching layer
9. **jest** - Testing framework
10. **supertest** - API testing
