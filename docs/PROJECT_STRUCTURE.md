# Project Structure

This document explains the organization and architecture of the CRUD API project.

## Directory Structure

```
CRUD-Mongodb-Express-Socket.io-Node.js/
├── app.js                  # Main application entry point
├── package.json            # Project dependencies and scripts
├── env.example             # Environment variables template
├── config/                 # Configuration files
│   └── swagger.js          # Swagger/OpenAPI documentation config
├── models/                 # Mongoose data models
│   ├── users.js           # User model schema
│   ├── todos.js           # Todo model schema
│   └── assignments.js     # Assignment model schema
├── routes/                # Express route handlers
│   ├── users.js           # User CRUD endpoints
│   ├── todos.js           # Todo CRUD endpoints
│   └── assignments.js     # Assignment CRUD endpoints
├── middleware/            # Custom middleware functions
│   ├── auth.js           # Authentication middleware
│   ├── errorHandler.js   # Global error handler
│   ├── logger.js         # Request logging
│   └── notFound.js       # 404 handler
└── docs/                 # Documentation files
    ├── PROJECT_STRUCTURE.md
    ├── API_REFERENCE.md
    ├── LIBRARIES.md
    ├── SETUP_GUIDE.md
    └── BEST_PRACTICES.md
```

## Core Components

### 1. Application Entry (`app.js`)

The main application file that:
- Initializes Express server
- Configures middleware (CORS, body parsing, logging)
- Sets up database connections
- Registers API routes
- Configures Socket.io for real-time features
- Handles graceful shutdown

**Key Features:**
- Modern async/await syntax
- Comprehensive error handling
- Socket.io integration for real-time todo updates
- Swagger documentation integration
- Health check endpoint

### 2. Models (`/models`)

Mongoose schemas defining data structure and validation rules:

#### **users.js**
- User profile information
- Fields: first_name, last_name, picture, email
- Built-in validation and timestamps

#### **todos.js**
- Todo list items
- Fields: title, description, complete, priority, dueDate
- Supports priority levels (low, medium, high)

#### **assignments.js**
- Assignment tracking
- Fields: title, content, status, dueDate, submittedDate, grade
- Status workflow: pending → in-progress → completed/cancelled

### 3. Routes (`/routes`)

RESTful API endpoints implementing full CRUD operations:

**HTTP Methods Supported:**
- `GET` - Retrieve resources
- `POST` - Create new resources
- `PUT` - Replace entire resource
- `PATCH` - Update specific fields
- `DELETE` - Remove resources

Each route file includes:
- Express-validator for input validation
- Consistent error handling
- Success/error response formatting
- Swagger documentation comments

### 4. Middleware (`/middleware`)

Custom middleware for cross-cutting concerns:

#### **logger.js**
- Logs all incoming requests
- Tracks response time and status codes
- Useful for debugging and monitoring

#### **errorHandler.js**
- Global error handling
- Formats validation errors
- Handles Mongoose errors (CastError, ValidationError, Duplicate keys)
- Development vs Production error responses

#### **auth.js**
- Authentication example using API keys
- Role-based authorization
- Easily extendable for JWT or OAuth

#### **notFound.js**
- Handles 404 errors for undefined routes
- Returns consistent error format

### 5. Configuration (`/config`)

#### **swagger.js**
- OpenAPI 3.0 specification
- Complete schema definitions
- Interactive API documentation UI
- Available at `/swagger`

## Data Flow

### HTTP Request Flow
```
Client Request
    ↓
Logger Middleware
    ↓
CORS Middleware
    ↓
Body Parser
    ↓
Route Handler
    ↓
Validation (express-validator)
    ↓
Controller Logic
    ↓
Mongoose Model
    ↓
MongoDB Database
    ↓
Response to Client
    ↓
Error Handler (if error occurs)
```

### Socket.io Real-time Flow
```
Client Connection
    ↓
Socket.io Server
    ↓
Event Listener (add, update, delete, all)
    ↓
Mongoose Model
    ↓
MongoDB Database
    ↓
Emit to Client & Broadcast to Others
```

## Design Patterns

### 1. MVC Pattern (Modified)
- **Models**: Mongoose schemas with validation
- **Controllers**: Embedded in route handlers
- **Views**: JSON responses (REST API)

### 2. Middleware Pattern
- Request/response pipeline
- Reusable cross-cutting concerns
- Error handling chain

### 3. Repository Pattern (via Mongoose)
- Data access abstraction
- Model methods for database operations

## Best Practices Implemented

✅ **Separation of Concerns**: Routes, models, middleware in separate files
✅ **DRY Principle**: Reusable validation middleware
✅ **Error Handling**: Centralized error handler
✅ **Environment Variables**: Configuration via .env
✅ **Input Validation**: Express-validator on all inputs
✅ **API Documentation**: Auto-generated Swagger docs
✅ **Consistent Responses**: Standardized success/error formats
✅ **Logging**: Request/response logging
✅ **Security**: CORS, input validation, error sanitization
✅ **Graceful Shutdown**: Proper cleanup on termination

## Scalability Considerations

### Current Architecture
- Suitable for small to medium applications
- Single server instance
- Direct MongoDB connection

### Future Enhancements
- Add rate limiting (express-rate-limit)
- Implement caching (Redis)
- Add authentication (JWT/OAuth)
- Database connection pooling
- Horizontal scaling with load balancer
- Microservices architecture for large scale
- Add testing (Jest, Supertest)
- CI/CD pipeline

## Database Schema

All models include automatic timestamps (`createdAt`, `updatedAt`) via Mongoose `timestamps: true` option.

### Relationships (Future Enhancement)
Currently, models are independent. Potential relationships:
- Users → Todos (one-to-many)
- Users → Assignments (one-to-many)
- Assignments → Submissions (one-to-many)

## Environment Specific Configuration

The application supports different environments:

**Development**
- Detailed error messages with stack traces
- Console logging enabled
- CORS open to all origins

**Production**
- Sanitized error messages
- Minimal logging
- Restricted CORS origins
- Environment variables for sensitive data
