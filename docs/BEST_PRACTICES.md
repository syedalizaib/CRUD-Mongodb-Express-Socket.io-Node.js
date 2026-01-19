# Best Practices Guide

This document outlines the best practices, patterns, and conventions used in this project.

## Table of Contents
- [Code Organization](#code-organization)
- [Mongoose Best Practices](#mongoose-best-practices)
- [Express Best Practices](#express-best-practices)
- [Validation](#validation)
- [Error Handling](#error-handling)
- [Security](#security)
- [Performance](#performance)
- [Testing](#testing)

---

## Code Organization

### File Structure
✅ **DO**: Organize by feature/module
```
routes/users.js
models/users.js
controllers/users.js  // if needed
```

✅ **DO**: Keep files focused and single-purpose
❌ **DON'T**: Put all routes in one file

### Naming Conventions
✅ **DO**:
- Files: lowercase with hyphens (`error-handler.js`)
- Variables/Functions: camelCase (`getUserById`)
- Classes/Models: PascalCase (`UserModel`)
- Constants: UPPER_SNAKE_CASE (`MAX_RETRIES`)

---

## Mongoose Best Practices

### Schema Definition

✅ **DO**: Use descriptive validation
```javascript
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (v) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v),
      message: 'Invalid email format'
    }
  }
}, { timestamps: true });
```

✅ **DO**: Enable timestamps
```javascript
{ timestamps: true }  // Adds createdAt, updatedAt automatically
```

✅ **DO**: Use proper data types
```javascript
age: { type: Number, min: 0, max: 150 }
status: { type: String, enum: ['active', 'inactive'] }
```

❌ **DON'T**: Store everything as String

### Queries

✅ **DO**: Use lean() for read-only operations
```javascript
const users = await User.find().lean();  // Returns plain JS objects, faster
```

✅ **DO**: Project only needed fields
```javascript
const users = await User.find().select('first_name last_name email');
```

✅ **DO**: Use indexes for frequent queries
```javascript
UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });
```

❌ **DON'T**: Fetch entire documents when you only need a few fields

### Error Handling

✅ **DO**: Handle all promise rejections
```javascript
try {
  const user = await User.findById(id);
} catch (error) {
  console.error('Database error:', error);
  throw error;
}
```

---

## Express Best Practices

### Route Handlers

✅ **DO**: Use async/await with try-catch
```javascript
router.get('/', async (req, res) => {
  try {
    const data = await Model.find();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
```

✅ **DO**: Return consistent response formats
```javascript
// Success
{ success: true, data: {...}, message: "..." }

// Error
{ success: false, error: "...", errors: [...] }
```

❌ **DON'T**: Send mixed response formats

### Middleware

✅ **DO**: Create reusable middleware
```javascript
// middleware/validateId.js
const validateId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  next();
};
```

✅ **DO**: Order middleware correctly
```javascript
app.use(cors());           // 1. CORS first
app.use(express.json());   // 2. Body parser
app.use(logger);           // 3. Logging
app.use('/api', routes);   // 4. Routes
app.use(notFound);         // 5. 404 handler
app.use(errorHandler);     // 6. Error handler (last!)
```

### Request/Response

✅ **DO**: Validate all inputs
```javascript
const { body, validationResult } = require('express-validator');

router.post('/', [
  body('email').isEmail(),
  body('age').isInt({ min: 0 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process request...
});
```

✅ **DO**: Set appropriate status codes
```javascript
res.status(201).json(...)  // Created
res.status(404).json(...)  // Not found
res.status(400).json(...)  // Bad request
```

❌ **DON'T**: Always return 200

---

## Validation

### Input Validation

✅ **DO**: Validate on both client AND server
✅ **DO**: Use express-validator for consistency
```javascript
body('email')
  .trim()
  .isEmail()
  .normalizeEmail()
  .withMessage('Valid email required')
```

✅ **DO**: Validate params and query strings
```javascript
param('id').isMongoId()
query('page').optional().isInt({ min: 1 })
```

### Schema Validation

✅ **DO**: Use Mongoose validators
```javascript
{
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  }
}
```

---

## Error Handling

### Centralized Error Handler

✅ **DO**: Use global error middleware
```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
};
```

### Custom Errors

✅ **DO**: Create custom error classes
```javascript
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}
```

### Error Responses

✅ **DO**: Sanitize errors in production
```javascript
res.status(500).json({
  error: 'Internal Server Error',
  ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
});
```

❌ **DON'T**: Expose sensitive error details in production

---

## Security

### Environment Variables

✅ **DO**: Use .env for sensitive data
```javascript
require('dotenv').config();
const dbUrl = process.env.DB_CONNECTION;
```

✅ **DO**: Add .env to .gitignore
❌ **DON'T**: Commit secrets to git

### CORS

✅ **DO**: Restrict origins in production
```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://yourdomain.com'
    : '*'
};
app.use(cors(corsOptions));
```

### Input Sanitization

✅ **DO**: Sanitize all user inputs
```javascript
body('name').trim().escape()
```

✅ **DO**: Use parameterized queries (Mongoose does this automatically)

### Authentication

✅ **DO**: Implement authentication for sensitive routes
```javascript
router.delete('/users/:id', authMiddleware, handler);
```

✅ **DO**: Use JWT or sessions for authentication
✅ **DO**: Hash passwords with bcrypt (if implementing user passwords)

### Headers

✅ **DO**: Use Helmet for security headers (future addition)
```javascript
const helmet = require('helmet');
app.use(helmet());
```

---

## Performance

### Database Queries

✅ **DO**: Use pagination for large datasets
```javascript
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

const users = await User.find()
  .limit(limit)
  .skip(skip)
  .lean();
```

✅ **DO**: Use indexes
```javascript
UserSchema.index({ email: 1 });
TodoSchema.index({ createdAt: -1 });
```

✅ **DO**: Avoid N+1 queries
```javascript
// Bad: N+1 queries
const users = await User.find();
for (let user of users) {
  user.posts = await Post.find({ userId: user._id });
}

// Good: Use populate or aggregation
const users = await User.find().populate('posts');
```

### Caching

✅ **DO**: Cache frequently accessed data (future addition)
```javascript
// Using Redis
const cachedData = await redis.get(key);
if (cachedData) return JSON.parse(cachedData);
```

### Compression

✅ **DO**: Compress responses (future addition)
```javascript
const compression = require('compression');
app.use(compression());
```

---

## Testing

### Unit Tests (Future Addition)

✅ **DO**: Test models
```javascript
describe('User Model', () => {
  it('should validate email', async () => {
    const user = new User({ email: 'invalid' });
    await expect(user.validate()).rejects.toThrow();
  });
});
```

### Integration Tests (Future Addition)

✅ **DO**: Test routes
```javascript
const request = require('supertest');
const app = require('./app');

describe('GET /users', () => {
  it('should return all users', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
```

---

## Code Quality

### Linting

✅ **DO**: Use ESLint (future addition)
```javascript
// .eslintrc.js
module.exports = {
  env: { node: true, es2021: true },
  extends: 'eslint:recommended',
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error'
  }
};
```

### Comments

✅ **DO**: Comment complex logic
```javascript
// Calculate user score based on activity and engagement
// Formula: (posts * 2) + (comments * 1) + (likes * 0.5)
const score = calculateUserScore(user);
```

✅ **DO**: Use JSDoc for functions
```javascript
/**
 * Retrieves user by ID
 * @param {string} userId - MongoDB ObjectId
 * @returns {Promise<User>} User object
 * @throws {NotFoundError} If user doesn't exist
 */
async function getUserById(userId) { ... }
```

❌ **DON'T**: Comment obvious code

---

## Git Practices

✅ **DO**: Use meaningful commit messages
```
feat: Add user authentication
fix: Correct validation error on email field
docs: Update API documentation
refactor: Simplify error handling logic
```

✅ **DO**: Keep commits atomic (one change per commit)
❌ **DON'T**: Commit commented-out code
❌ **DON'T**: Commit console.logs (or use proper logging)

---

## Production Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] Error logging configured (Winston/Sentry)
- [ ] Rate limiting implemented
- [ ] HTTPS enabled
- [ ] CORS restricted to specific origins
- [ ] Helmet security headers added
- [ ] Compression enabled
- [ ] Database indexes created
- [ ] Monitoring/alerting set up
- [ ] Health check endpoint working
- [ ] Graceful shutdown implemented ✅
- [ ] Process manager (PM2) configured
- [ ] Load testing completed

---

## Resources

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Mongoose Best Practices](https://mongoosejs.com/docs/guide.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [REST API Design](https://restfulapi.net/)
- [OWASP Security Guidelines](https://owasp.org/)
