# Project Architecture Diagrams

Visual representations of the project architecture and data flow.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐         ┌─────────────────┐              │
│  │  HTTP Clients   │         │  Socket.io      │              │
│  │  (Browser,      │         │  Clients        │              │
│  │   Postman,      │         │  (Real-time)    │              │
│  │   Mobile App)   │         │                 │              │
│  └────────┬────────┘         └────────┬────────┘              │
│           │                           │                         │
└───────────┼───────────────────────────┼─────────────────────────┘
            │                           │
            │                           │
┌───────────┼───────────────────────────┼─────────────────────────┐
│           │    API SERVER (PORT 3000) │                         │
│           │                           │                         │
│  ┌────────▼────────┐         ┌────────▼────────┐              │
│  │  Express.js     │         │  Socket.io      │              │
│  │  HTTP Server    │         │  Server         │              │
│  └────────┬────────┘         └────────┬────────┘              │
│           │                           │                         │
│  ┌────────▼──────────────────────────▼────────┐              │
│  │         MIDDLEWARE LAYER                     │              │
│  │  ┌────────────────────────────────────────┐ │              │
│  │  │ • CORS                                  │ │              │
│  │  │ • Body Parser                           │ │              │
│  │  │ • Logger                                │ │              │
│  │  │ • Authentication (Optional)             │ │              │
│  │  └────────────────────────────────────────┘ │              │
│  └────────────────┬─────────────────────────────┘              │
│                   │                                             │
│  ┌────────────────▼─────────────────────────────┐              │
│  │         ROUTE HANDLERS                        │              │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │              │
│  │  │  /users  │ │  /todos  │ │/assignments  │ │              │
│  │  └──────────┘ └──────────┘ └──────────────┘ │              │
│  │  Express-validator applied to all routes     │              │
│  └────────────────┬─────────────────────────────┘              │
│                   │                                             │
│  ┌────────────────▼─────────────────────────────┐              │
│  │         MONGOOSE MODELS                       │              │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │              │
│  │  │  User    │ │  Todo    │ │  Assignment  │ │              │
│  │  │  Model   │ │  Model   │ │  Model       │ │              │
│  │  └──────────┘ └──────────┘ └──────────────┘ │              │
│  │  Schema validation and business logic        │              │
│  └────────────────┬─────────────────────────────┘              │
│                   │                                             │
└───────────────────┼─────────────────────────────────────────────┘
                    │
                    │
┌───────────────────▼─────────────────────────────────────────────┐
│                    DATABASE LAYER                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │           MongoDB Database                                 │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────┐           │ │
│  │  │  users  │  │  todos  │  │  assignments    │           │ │
│  │  │  collection│ │collection│ │  collection     │           │ │
│  │  └─────────┘  └─────────┘  └─────────────────┘           │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow

### HTTP REST API Request Flow

```
┌─────────────┐
│   Client    │
│  (Browser,  │
│   Postman)  │
└──────┬──────┘
       │
       │ HTTP Request (GET, POST, PUT, PATCH, DELETE)
       ▼
┌──────────────────────────────────────────────────┐
│              Express Middleware Chain             │
├──────────────────────────────────────────────────┤
│ 1. CORS                                           │
│    └─ Check origin, methods, headers             │
│                                                   │
│ 2. Body Parser                                    │
│    └─ Parse JSON body                            │
│                                                   │
│ 3. Logger                                         │
│    └─ Log request: timestamp, method, path       │
│                                                   │
│ 4. Route Handler                                  │
│    └─ Match URL pattern                          │
└──────┬───────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│           Express-Validator                       │
├──────────────────────────────────────────────────┤
│ • Validate request body                           │
│ • Validate URL parameters                         │
│ • Validate query strings                          │
│ • Return 400 if validation fails                  │
└──────┬───────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│              Controller Logic                     │
├──────────────────────────────────────────────────┤
│ try {                                             │
│   • Parse request data                            │
│   • Call Mongoose model methods                   │
│   • Process business logic                        │
│   • Format response                               │
│ } catch (error) {                                 │
│   • Handle error                                  │
│ }                                                 │
└──────┬───────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│              Mongoose Model                       │
├──────────────────────────────────────────────────┤
│ • Apply schema validation                         │
│ • Execute database query                          │
│ • Return result or error                          │
└──────┬───────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│              MongoDB Database                     │
├──────────────────────────────────────────────────┤
│ • Execute query (find, create, update, delete)    │
│ • Return documents or acknowledgment              │
└──────┬───────────────────────────────────────────┘
       │
       │ Success or Error
       ▼
┌──────────────────────────────────────────────────┐
│              Response                             │
├──────────────────────────────────────────────────┤
│ Success: { success: true, data: {...} }          │
│ Error:   { success: false, error: "..." }        │
└──────┬───────────────────────────────────────────┘
       │
       │ HTTP Response (JSON)
       ▼
┌─────────────┐
│   Client    │
│  (Receives  │
│   Response) │
└─────────────┘
```

### Socket.io Real-time Flow

```
┌─────────────┐
│   Client    │
│ (Browser)   │
└──────┬──────┘
       │
       │ WebSocket Connection
       ▼
┌──────────────────────────────────────────────────┐
│              Socket.io Server                     │
├──────────────────────────────────────────────────┤
│ Event: 'connection'                               │
│ • Track user by IP address                        │
│ • Increment user count                            │
│ • Emit 'count' to client                          │
│ • Broadcast 'count' to others                     │
└──────┬───────────────────────────────────────────┘
       │
       │ Client emits event (add, update, delete, all)
       ▼
┌──────────────────────────────────────────────────┐
│              Event Handler                        │
├──────────────────────────────────────────────────┤
│ Event: 'add'                                      │
│   • Create Todo in database                       │
│   • Emit 'added' to sender                        │
│   • Broadcast 'added' to others                   │
│                                                   │
│ Event: 'update'                                   │
│   • Update Todo in database                       │
│   • Emit 'updated' to all clients                 │
│                                                   │
│ Event: 'delete'                                   │
│   • Delete Todo from database                     │
│   • Emit 'deleted' to all clients                 │
│                                                   │
│ Event: 'all'                                      │
│   • Fetch all Todos                               │
│   • Emit 'all' to requesting client               │
└──────┬───────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│              MongoDB Database                     │
│ • Execute operation                               │
│ • Return result                                   │
└──────┬───────────────────────────────────────────┘
       │
       │ Result
       ▼
┌──────────────────────────────────────────────────┐
│        Emit/Broadcast to Clients                  │
├──────────────────────────────────────────────────┤
│ socket.emit()      → Send to sender only          │
│ socket.broadcast.emit() → Send to others          │
│ io.emit()          → Send to everyone             │
└──────┬───────────────────────────────────────────┘
       │
       │ Real-time update
       ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Client 1   │    │  Client 2   │    │  Client 3   │
│  (Updated)  │    │  (Updated)  │    │  (Updated)  │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Middleware Stack

```
Request enters →

┌─────────────────────────────────────────┐
│ 1. CORS Middleware                       │
│    • Check origin                        │
│    • Add CORS headers                    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ 2. Body Parser (express.json())         │
│    • Parse JSON body                     │
│    • Attach to req.body                  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ 3. Logger Middleware                     │
│    • Log timestamp                       │
│    • Log method, URL, IP                 │
│    • Track response time                 │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ 4. Routes (/users, /todos, etc.)        │
│    • Match URL pattern                   │
│    • Execute handler                     │
└─────────────────┬───────────────────────┘
                  │
                  ├─→ Route found → Handler
                  │
┌─────────────────▼───────────────────────┐
│ 5. 404 Not Found Middleware             │
│    • No route matched                    │
│    • Return 404 error                    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ 6. Error Handler Middleware             │
│    • Catch all errors                    │
│    • Format error response               │
│    • Log error details                   │
└─────────────────┬───────────────────────┘
                  │
                  ▼ Response sent to client
```

## Error Handling Flow

```
┌─────────────────────────────────────────┐
│         Error Occurs                     │
│  • Validation error                      │
│  • Database error                        │
│  • Business logic error                  │
│  • Unexpected error                      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    Try-Catch Block (in route handler)   │
│                                          │
│    try {                                 │
│      // operation                        │
│    } catch (err) {                       │
│      // handle locally or pass to next   │
│    }                                     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    Global Error Handler Middleware      │
│                                          │
│    if (ValidationError)                  │
│      → 400 Bad Request                   │
│                                          │
│    if (CastError - invalid ID)           │
│      → 400 Invalid ID                    │
│                                          │
│    if (Duplicate Key)                    │
│      → 409 Conflict                      │
│                                          │
│    else                                  │
│      → 500 Internal Server Error         │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    Formatted Error Response              │
│                                          │
│    {                                     │
│      "success": false,                   │
│      "error": "Error message",           │
│      "errors": [...]  // if validation   │
│    }                                     │
└─────────────────┬───────────────────────┘
                  │
                  ▼ Sent to client
```

## Data Models Relationship

```
┌─────────────────────────────────────────────────┐
│                   users                          │
├─────────────────────────────────────────────────┤
│ _id          : ObjectId                          │
│ first_name   : String (required, 2-50 chars)     │
│ last_name    : String (required, 2-50 chars)     │
│ picture      : String (required)                 │
│ email        : String (unique, optional)         │
│ createdAt    : Date                              │
│ updatedAt    : Date                              │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│                   todos                          │
├─────────────────────────────────────────────────┤
│ _id          : ObjectId                          │
│ title        : String (required, 3-200 chars)    │
│ description  : String (optional, max 1000)       │
│ complete     : Boolean (default: false)          │
│ priority     : String (low/medium/high)          │
│ dueDate      : Date (optional)                   │
│ createdAt    : Date                              │
│ updatedAt    : Date                              │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│                assignments                       │
├─────────────────────────────────────────────────┤
│ _id          : ObjectId                          │
│ title        : String (required, 5-200 chars)    │
│ content      : String (required, min 10 chars)   │
│ status       : String (pending/in-progress/...)  │
│ dueDate      : Date (required)                   │
│ submittedDate: Date (optional)                   │
│ grade        : Number (0-100, optional)          │
│ createdAt    : Date                              │
│ updatedAt    : Date                              │
└─────────────────────────────────────────────────┘

Note: Currently no relationships between models
Future: Could add userId field to todos/assignments
```

## File Organization Pattern

```
Feature-based organization:

For each resource (users, todos, assignments):
  ├── Model      (models/users.js)
  │   └─ Schema definition, validation
  │
  └── Routes     (routes/users.js)
      └─ CRUD endpoints, validation rules

Shared concerns:
  ├── Middleware  (middleware/)
  │   └─ Reusable across all routes
  │
  ├── Config      (config/)
  │   └─ Application-wide configuration
  │
  └── Docs        (docs/)
      └─ Documentation for the project
```

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────┐
│              Load Balancer                       │
│         (NGINX or Cloud Provider)                │
└─────────────┬───────────────────────────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
┌───▼───┐ ┌──▼────┐ ┌──▼────┐
│ App   │ │ App   │ │ App   │
│ Inst 1│ │ Inst 2│ │ Inst 3│
└───┬───┘ └───┬───┘ └───┬───┘
    │         │         │
    └─────────┼─────────┘
              │
    ┌─────────▼─────────┐
    │   MongoDB Cluster  │
    │  (Replica Set)     │
    └────────────────────┘
```

---

This visual guide complements the text documentation and helps understand the project's architecture at a glance.
