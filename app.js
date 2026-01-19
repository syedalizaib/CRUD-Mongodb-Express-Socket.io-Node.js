const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Import middleware
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

// Import Swagger configuration
const setupSwagger = require("./config/swagger");

// Import models
const Todo = require("./models/todos");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns API status and basic information
 *     responses:
 *       200:
 *         description: API is running successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: API is running
 *                 version:
 *                   type: string
 *                   example: 2.0.0
 */

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  credentials: true
};

app.use(cors(corsOptions));

// Body parser middleware (built into Express 4.16+)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom logger middleware
app.use(logger);

// ============================================
// SWAGGER DOCUMENTATION
// ============================================
setupSwagger(app);

// ============================================
// API ROUTES
// ============================================

// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    version: "2.0.0",
    endpoints: {
      users: "/users",
      todos: "/todos",
      assignments: "/assignments",
      documentation: "/swagger"
    }
  });
});

// Import and use route modules
const userRoutes = require("./routes/users");
const todoRoutes = require("./routes/todos");
const assignmentRoutes = require("./routes/assignments");

app.use("/users", userRoutes);
app.use("/todos", todoRoutes);
app.use("/assignments", assignmentRoutes);

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 handler (must be after all routes)
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

// ============================================
// DATABASE CONNECTION
// ============================================

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION || "mongodb://localhost:27017/crud-api", {
      // Remove deprecated options - these are now defaults in Mongoose 6+
    });
    console.log("✓ MongoDB connected successfully");
  } catch (error) {
    console.error("✗ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Handle MongoDB connection events
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error:", err);
});

// ============================================
// HTTP & SOCKET.IO SERVER SETUP
// ============================================

const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"]
  }
});

// Make Socket.io instance available to routes
app.set('io', io);

// Socket.io connection tracking
let connectedUsers = {};

// ============================================
// SOCKET.IO EVENT HANDLERS
// ============================================

io.on("connection", (socket) => {
  const address = socket.handshake.address;
  
  // Track connected users by address
  if (!connectedUsers[address]) {
    connectedUsers[address] = [];
  }
  connectedUsers[address].push(socket.id);
  
  const userCount = Object.keys(connectedUsers).length;
  
  console.log(`✓ User connected: ${socket.id} | Total users: ${userCount}`);
  
  // Send current user count to the connected client
  socket.emit("count", { count: userCount });
  
  // Broadcast user count to all other clients
  socket.broadcast.emit("count", { count: userCount });

  /**
   * Handle 'all' event - Get all todos
   */
  socket.on("all", async () => {
    try {
      const todos = await Todo.find({}).sort({ createdAt: -1 });
      socket.emit("all", todos);
    } catch (err) {
      console.error("Error fetching todos:", err);
      socket.emit("error", { message: "Failed to fetch todos" });
    }
  });

  /**
   * Handle 'add' event - Create new todo
   */
  socket.on("add", async (data) => {
    try {
      const todo = new Todo({
        title: data.title,
        description: data.description,
        complete: false,
        priority: data.priority || 'medium'
      });

      const savedTodo = await todo.save();
      
      // Send to the creator
      socket.emit("added", savedTodo);
      
      // Broadcast to all other clients
      socket.broadcast.emit("added", savedTodo);
      
      console.log(`✓ Todo created: ${savedTodo.title}`);
    } catch (err) {
      console.error("Error creating todo:", err);
      socket.emit("error", { message: "Failed to create todo" });
    }
  });

  /**
   * Handle 'update' event - Update todo
   */
  socket.on("update", async (data) => {
    try {
      const updatedTodo = await Todo.findByIdAndUpdate(
        data.id,
        { $set: data.updates },
        { new: true, runValidators: true }
      );
      
      if (updatedTodo) {
        socket.emit("updated", updatedTodo);
        socket.broadcast.emit("updated", updatedTodo);
        console.log(`✓ Todo updated: ${updatedTodo.title}`);
      } else {
        socket.emit("error", { message: "Todo not found" });
      }
    } catch (err) {
      console.error("Error updating todo:", err);
      socket.emit("error", { message: "Failed to update todo" });
    }
  });

  /**
   * Handle 'delete' event - Delete todo
   */
  socket.on("delete", async (data) => {
    try {
      const deletedTodo = await Todo.findByIdAndDelete(data.id);
      
      if (deletedTodo) {
        socket.emit("deleted", { id: data.id });
        socket.broadcast.emit("deleted", { id: data.id });
        console.log(`✓ Todo deleted: ${deletedTodo.title}`);
      } else {
        socket.emit("error", { message: "Todo not found" });
      }
    } catch (err) {
      console.error("Error deleting todo:", err);
      socket.emit("error", { message: "Failed to delete todo" });
    }
  });

  /**
   * Handle disconnect event
   */
  socket.on("disconnect", () => {
    // Remove socket from tracking
    if (connectedUsers[address]) {
      connectedUsers[address] = connectedUsers[address].filter(id => id !== socket.id);
      
      // Remove address if no more sockets
      if (connectedUsers[address].length === 0) {
        delete connectedUsers[address];
      }
    }
    
    const userCount = Object.keys(connectedUsers).length;
    
    console.log(`✗ User disconnected: ${socket.id} | Total users: ${userCount}`);
    
    // Broadcast updated user count
    io.emit("count", { count: userCount });
  });
});

// ============================================
// START SERVER
// ============================================

server.listen(PORT, () => {
  console.log("================================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/swagger`);
  console.log(`🔌 Socket.io enabled for real-time features`);
  console.log("================================================");
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

const gracefulShutdown = async () => {
  console.log("\n⚠ Shutting down gracefully...");
  
  // Close HTTP server
  server.close(() => {
    console.log("✓ HTTP server closed");
  });
  
  // Close database connection
  try {
    await mongoose.connection.close();
    console.log("✓ Database connection closed");
    process.exit(0);
  } catch (err) {
    console.error("✗ Error during shutdown:", err);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  gracefulShutdown();
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  gracefulShutdown();
});

module.exports = app;
