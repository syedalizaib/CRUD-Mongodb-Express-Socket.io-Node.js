# Setup Guide

Complete guide to setting up and running the CRUD API project.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (v5.0 or higher)
  - Local installation OR MongoDB Atlas account

### Check Versions
```bash
node --version
npm --version
mongod --version  # If using local MongoDB
```

---

## Installation Steps

### 1. Clone or Download Project
```bash
cd /path/to/your/projects
# If using git:
git clone <repository-url>
cd CRUD-Mongodb-Express-Socket.io-Node.js
```

### 2. Install Dependencies
```bash
npm install
```

This will install all dependencies listed in `package.json`:
- express
- mongoose
- socket.io
- express-validator
- cors
- dotenv
- swagger-jsdoc
- swagger-ui-express
- nodemon (dev dependency)

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server
PORT=3000
NODE_ENV=development

# Database - Choose one:
# Option 1: Local MongoDB
DB_CONNECTION=mongodb://localhost:27017/crud-api

# Option 2: MongoDB Atlas (Cloud)
# DB_CONNECTION=mongodb+srv://username:password@cluster.mongodb.net/crud-api?retryWrites=true&w=majority

# CORS
CORS_ORIGIN=*

# Authentication (Optional)
API_KEY=demo-key-12345
```

---

## MongoDB Setup

### Option A: Local MongoDB

#### Install MongoDB (macOS)
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

#### Install MongoDB (Ubuntu/Debian)
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list

# Install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Install MongoDB (Windows)
1. Download installer from https://www.mongodb.com/try/download/community
2. Run installer and follow wizard
3. Start MongoDB as a service

#### Verify MongoDB is Running
```bash
# Check status
mongo --version

# Connect to MongoDB shell
mongosh  # or 'mongo' for older versions
```

### Option B: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free tier available)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password
7. Add to `.env` file as `DB_CONNECTION`

**Important**: Add your IP address to the whitelist in Atlas:
- Go to Network Access
- Click "Add IP Address"
- Add your current IP or 0.0.0.0/0 (allow from anywhere - development only)

---

## Running the Application

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Expected Output
```
================================================
🚀 Server running on port 3000
📚 API Documentation: http://localhost:3000/swagger
🔌 Socket.io enabled for real-time features
================================================
✓ MongoDB connected successfully
```

---

## Testing the API

### 1. Using Browser
Visit http://localhost:3000 - You should see:
```json
{
  "success": true,
  "message": "API is running",
  "version": "2.0.0",
  "endpoints": {
    "users": "/users",
    "todos": "/todos",
    "assignments": "/assignments",
    "documentation": "/swagger"
  }
}
```

### 2. Using Swagger UI
Visit http://localhost:3000/swagger for interactive API documentation.

### 3. Using cURL

**Get all users:**
```bash
curl http://localhost:3000/users
```

**Create a user:**
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

**Get specific user:**
```bash
curl http://localhost:3000/users/<user-id>
```

**Update user (PATCH):**
```bash
curl -X PATCH http://localhost:3000/users/<user-id> \
  -H "Content-Type: application/json" \
  -d '{"first_name": "Jane"}'
```

**Delete user:**
```bash
curl -X DELETE http://localhost:3000/users/<user-id>
```

### 4. Using Postman

1. Download Postman from https://www.postman.com/
2. Import the API by pasting: http://localhost:3000/swagger.json
3. Test all endpoints interactively

---

## Socket.io Testing

### Using Socket.io Client (Browser Console)

```html
<!-- Add to your HTML file -->
<script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
<script>
  const socket = io('http://localhost:3000');
  
  // Listen for connection
  socket.on('connect', () => {
    console.log('Connected:', socket.id);
  });
  
  // Get all todos
  socket.emit('all');
  socket.on('all', (todos) => {
    console.log('Todos:', todos);
  });
  
  // Add a todo
  socket.emit('add', {
    title: 'Test Todo',
    description: 'This is a test',
    priority: 'high'
  });
  
  // Listen for new todos
  socket.on('added', (todo) => {
    console.log('New todo:', todo);
  });
  
  // Listen for user count
  socket.on('count', (data) => {
    console.log('Connected users:', data.count);
  });
</script>
```

---

## Project Structure Overview

```
├── app.js              # Main application file
├── package.json        # Dependencies
├── env.example         # Environment template
├── config/
│   └── swagger.js     # API documentation config
├── models/            # Database schemas
│   ├── users.js
│   ├── todos.js
│   └── assignments.js
├── routes/            # API endpoints
│   ├── users.js
│   ├── todos.js
│   └── assignments.js
├── middleware/        # Custom middleware
│   ├── auth.js
│   ├── errorHandler.js
│   ├── logger.js
│   └── notFound.js
└── docs/             # Documentation
```

---

## Common Issues & Solutions

### Issue: MongoDB Connection Error
**Error**: `MongoNetworkError: connect ECONNREFUSED`

**Solutions:**
1. Check if MongoDB is running: `sudo systemctl status mongod`
2. Start MongoDB: `sudo systemctl start mongod`
3. Verify connection string in `.env`
4. Check firewall settings

### Issue: Port Already in Use
**Error**: `EADDRINUSE: address already in use :::3000`

**Solutions:**
1. Change port in `.env`: `PORT=3001`
2. Kill process using port: `lsof -ti:3000 | xargs kill -9`
3. Use different port temporarily

### Issue: Module Not Found
**Error**: `Cannot find module 'express'`

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Validation Errors
**Error**: `ValidationError: Path 'first_name' is required`

**Solution:**
- Ensure all required fields are provided in request body
- Check field names match schema
- Verify data types are correct

### Issue: CORS Errors
**Error**: `Access-Control-Allow-Origin header is not present`

**Solutions:**
1. Check CORS configuration in `app.js`
2. Update `CORS_ORIGIN` in `.env`
3. Ensure frontend origin is allowed

---

## Development Workflow

### 1. Start Development Server
```bash
npm run dev
```

### 2. Make Changes
- Edit files in your code editor
- Server automatically restarts with nodemon

### 3. Test Changes
- Use Swagger UI at http://localhost:3000/swagger
- Check terminal for errors and logs

### 4. Monitor Logs
Watch the terminal for:
- Request logs: `[timestamp] METHOD PATH - Status: CODE`
- Connection logs: `✓ User connected`
- Database logs: `✓ MongoDB connected successfully`

---

## Database Management

### View Data (MongoDB Shell)
```bash
mongosh  # or 'mongo' for older versions

use crud-api
db.users.find().pretty()
db.todos.find().pretty()
db.assignments.find().pretty()
```

### Clear Collections
```bash
db.users.deleteMany({})
db.todos.deleteMany({})
db.assignments.deleteMany({})
```

### Database Tools
- **MongoDB Compass**: GUI for MongoDB (https://www.mongodb.com/products/compass)
- **Studio 3T**: Advanced MongoDB IDE (https://studio3t.com/)

---

## Next Steps

1. ✅ API is running
2. 📖 Read the [API Reference](./API_REFERENCE.md)
3. 🔨 Explore endpoints via Swagger UI
4. 🧪 Test with Postman or cURL
5. 🔌 Try Socket.io real-time features
6. 📚 Review [Best Practices](./BEST_PRACTICES.md)

---

## Production Deployment

### Preparation Checklist

- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use production MongoDB instance (Atlas recommended)
- [ ] Configure specific CORS origins (not `*`)
- [ ] Set strong API keys and secrets
- [ ] Enable HTTPS
- [ ] Implement rate limiting
- [ ] Set up logging (Winston)
- [ ] Configure PM2 or similar process manager
- [ ] Set up monitoring (New Relic, DataDog)
- [ ] Configure backups for database

### Using PM2 (Production Process Manager)
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start app.js --name "crud-api"

# Monitor
pm2 status
pm2 logs crud-api

# Restart
pm2 restart crud-api

# Auto-restart on system reboot
pm2 startup
pm2 save
```

---

## Getting Help

If you encounter issues:

1. Check the [API Reference](./API_REFERENCE.md)
2. Review error messages in terminal
3. Test with Swagger UI at `/swagger`
4. Check MongoDB connection
5. Verify environment variables in `.env`
6. Review logs for detailed error information

## Additional Resources

- **Express.js Documentation**: https://expressjs.com/
- **Mongoose Documentation**: https://mongoosejs.com/
- **Socket.io Documentation**: https://socket.io/
- **MongoDB Manual**: https://docs.mongodb.com/
