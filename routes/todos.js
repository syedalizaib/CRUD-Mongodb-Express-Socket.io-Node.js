const express = require("express");
const router = express.Router();
const { body, param, validationResult } = require("express-validator");
const Todo = require("../models/todos");

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

/**
 * @swagger
 * /todos:
 *   get:
 *     tags: [Todos]
 *     summary: Get all todos
 *     description: Retrieve all todos with optional filtering by completion status and priority
 *     parameters:
 *       - in: query
 *         name: complete
 *         schema:
 *           type: boolean
 *         description: Filter by completion status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by priority level
 *     responses:
 *       200:
 *         description: Successfully retrieved todos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Todo'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/", async (req, res) => {
  try {
    const { complete, priority } = req.query;
    const filter = {};
    
    if (complete !== undefined) {
      filter.complete = complete === 'true';
    }
    
    if (priority) {
      filter.priority = priority;
    }

    const todos = await Todo.find(filter).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * @swagger
 * /todos/{todoId}:
 *   get:
 *     tags: [Todos]
 *     summary: Get todo by ID
 *     description: Retrieve a specific todo by its MongoDB ObjectId
 *     parameters:
 *       - in: path
 *         name: todoId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the todo
 *     responses:
 *       200:
 *         description: Successfully retrieved todo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  "/:todoId",
  [
    param("todoId")
      .isMongoId()
      .withMessage("Invalid todo ID format")
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const todo = await Todo.findById(req.params.todoId);
      
      if (!todo) {
        return res.status(404).json({
          success: false,
          error: "Todo not found"
        });
      }

      res.json({
        success: true,
        data: todo
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
);

/**
 * @swagger
 * /todos:
 *   post:
 *     tags: [Todos]
 *     summary: Create a new todo
 *     description: Create a new todo item with validation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 example: Complete project documentation
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Finish all documentation files for the project
 *               complete:
 *                 type: boolean
 *                 default: false
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-01-25T00:00:00.000Z
 *     responses:
 *       201:
 *         description: Todo created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  "/",
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 3, max: 200 })
      .withMessage("Title must be between 3 and 200 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Description cannot exceed 1000 characters"),
    body("complete")
      .optional()
      .isBoolean()
      .withMessage("Complete must be a boolean value"),
    body("priority")
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage("Priority must be low, medium, or high"),
    body("dueDate")
      .optional()
      .isISO8601()
      .withMessage("Due date must be a valid date")
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const todo = new Todo({
        title: req.body.title,
        description: req.body.description,
        complete: req.body.complete || false,
        priority: req.body.priority || 'medium',
        dueDate: req.body.dueDate
      });

      const savedTodo = await todo.save();
      res.status(201).json({
        success: true,
        message: "Todo created successfully",
        data: savedTodo
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
);

/**
 * @swagger
 * /todos/{todoId}:
 *   put:
 *     tags: [Todos]
 *     summary: Update entire todo
 *     description: Replace all todo fields with new values
 *     parameters:
 *       - in: path
 *         name: todoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - complete
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               complete:
 *                 type: boolean
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Todo updated successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put(
  "/:todoId",
  [
    param("todoId")
      .isMongoId()
      .withMessage("Invalid todo ID format"),
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 3, max: 200 })
      .withMessage("Title must be between 3 and 200 characters"),
    body("complete")
      .isBoolean()
      .withMessage("Complete must be a boolean value"),
    body("priority")
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage("Priority must be low, medium, or high")
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const updatedTodo = await Todo.findByIdAndUpdate(
        req.params.todoId,
        {
          title: req.body.title,
          description: req.body.description,
          complete: req.body.complete,
          priority: req.body.priority || 'medium',
          dueDate: req.body.dueDate,
          updatedAt: Date.now()
        },
        { new: true, runValidators: true }
      );

      if (!updatedTodo) {
        return res.status(404).json({
          success: false,
          error: "Todo not found"
        });
      }

      res.json({
        success: true,
        message: "Todo updated successfully",
        data: updatedTodo
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
);

/**
 * @swagger
 * /todos/{todoId}:
 *   patch:
 *     tags: [Todos]
 *     summary: Update specific todo fields
 *     description: Update only specified fields of a todo
 *     parameters:
 *       - in: path
 *         name: todoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               complete:
 *                 type: boolean
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Todo updated successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch(
  "/:todoId",
  [
    param("todoId")
      .isMongoId()
      .withMessage("Invalid todo ID format"),
    body("title")
      .optional()
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage("Title must be between 3 and 200 characters"),
    body("complete")
      .optional()
      .isBoolean()
      .withMessage("Complete must be a boolean value"),
    body("priority")
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage("Priority must be low, medium, or high")
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const updateFields = {};
      if (req.body.title !== undefined) updateFields.title = req.body.title;
      if (req.body.description !== undefined) updateFields.description = req.body.description;
      if (req.body.complete !== undefined) updateFields.complete = req.body.complete;
      if (req.body.priority !== undefined) updateFields.priority = req.body.priority;
      if (req.body.dueDate !== undefined) updateFields.dueDate = req.body.dueDate;
      updateFields.updatedAt = Date.now();

      const updatedTodo = await Todo.findByIdAndUpdate(
        req.params.todoId,
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      if (!updatedTodo) {
        return res.status(404).json({
          success: false,
          error: "Todo not found"
        });
      }

      res.json({
        success: true,
        message: "Todo updated successfully",
        data: updatedTodo
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
);

/**
 * @swagger
 * /todos/{todoId}:
 *   delete:
 *     tags: [Todos]
 *     summary: Delete todo
 *     description: Remove a todo from the database
 *     parameters:
 *       - in: path
 *         name: todoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Todo deleted successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete(
  "/:todoId",
  [
    param("todoId")
      .isMongoId()
      .withMessage("Invalid todo ID format")
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const removedTodo = await Todo.findByIdAndDelete(req.params.todoId);

      if (!removedTodo) {
        return res.status(404).json({
          success: false,
          error: "Todo not found"
        });
      }

      res.json({
        success: true,
        message: "Todo deleted successfully",
        data: removedTodo
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
);

module.exports = router;
