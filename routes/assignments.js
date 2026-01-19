const express = require("express");
const router = express.Router();
const { body, param, validationResult } = require("express-validator");
const Assignment = require("../models/assignments");

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
 * /assignments:
 *   get:
 *     tags: [Assignments]
 *     summary: Get all assignments
 *     description: Retrieve all assignments with optional filtering by status
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, completed, cancelled]
 *         description: Filter by assignment status
 *     responses:
 *       200:
 *         description: Successfully retrieved assignments
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
 *                     $ref: '#/components/schemas/Assignment'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    
    if (status) {
      filter.status = status;
    }

    const assignments = await Assignment.find(filter).sort({ dueDate: 1 });
    res.json({
      success: true,
      count: assignments.length,
      data: assignments
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
 * /assignments/{assignmentId}:
 *   get:
 *     tags: [Assignments]
 *     summary: Get assignment by ID
 *     description: Retrieve a specific assignment by its MongoDB ObjectId
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the assignment
 *     responses:
 *       200:
 *         description: Successfully retrieved assignment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Assignment'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  "/:assignmentId",
  [
    param("assignmentId")
      .isMongoId()
      .withMessage("Invalid assignment ID format")
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const assignment = await Assignment.findById(req.params.assignmentId);
      
      if (!assignment) {
        return res.status(404).json({
          success: false,
          error: "Assignment not found"
        });
      }

      res.json({
        success: true,
        data: assignment
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
 * /assignments:
 *   post:
 *     tags: [Assignments]
 *     summary: Create a new assignment
 *     description: Create a new assignment with validation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - dueDate
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *                 example: Backend Development Assignment
 *               content:
 *                 type: string
 *                 minLength: 10
 *                 example: Build a REST API with Express and MongoDB
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed, cancelled]
 *                 default: pending
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-01-30T00:00:00.000Z
 *               submittedDate:
 *                 type: string
 *                 format: date-time
 *               grade:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 95
 *     responses:
 *       201:
 *         description: Assignment created successfully
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
 *                   $ref: '#/components/schemas/Assignment'
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
      .isLength({ min: 5, max: 200 })
      .withMessage("Title must be between 5 and 200 characters"),
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Content is required")
      .isLength({ min: 10 })
      .withMessage("Content must be at least 10 characters long"),
    body("status")
      .optional()
      .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
      .withMessage("Status must be pending, in-progress, completed, or cancelled"),
    body("dueDate")
      .notEmpty()
      .withMessage("Due date is required")
      .isISO8601()
      .withMessage("Due date must be a valid date"),
    body("grade")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Grade must be between 0 and 100")
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const assignment = new Assignment({
        title: req.body.title,
        content: req.body.content,
        status: req.body.status || 'pending',
        dueDate: req.body.dueDate,
        submittedDate: req.body.submittedDate,
        grade: req.body.grade
      });

      const savedAssignment = await assignment.save();
      res.status(201).json({
        success: true,
        message: "Assignment created successfully",
        data: savedAssignment
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
 * /assignments/{assignmentId}:
 *   put:
 *     tags: [Assignments]
 *     summary: Update entire assignment
 *     description: Replace all assignment fields with new values
 *     parameters:
 *       - in: path
 *         name: assignmentId
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
 *               - content
 *               - dueDate
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed, cancelled]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               submittedDate:
 *                 type: string
 *                 format: date-time
 *               grade:
 *                 type: number
 *     responses:
 *       200:
 *         description: Assignment updated successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put(
  "/:assignmentId",
  [
    param("assignmentId")
      .isMongoId()
      .withMessage("Invalid assignment ID format"),
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 5, max: 200 })
      .withMessage("Title must be between 5 and 200 characters"),
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Content is required")
      .isLength({ min: 10 })
      .withMessage("Content must be at least 10 characters long"),
    body("dueDate")
      .notEmpty()
      .withMessage("Due date is required")
      .isISO8601()
      .withMessage("Due date must be a valid date")
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const updatedAssignment = await Assignment.findByIdAndUpdate(
        req.params.assignmentId,
        {
          title: req.body.title,
          content: req.body.content,
          status: req.body.status || 'pending',
          dueDate: req.body.dueDate,
          submittedDate: req.body.submittedDate,
          grade: req.body.grade,
          updatedAt: Date.now()
        },
        { new: true, runValidators: true }
      );

      if (!updatedAssignment) {
        return res.status(404).json({
          success: false,
          error: "Assignment not found"
        });
      }

      res.json({
        success: true,
        message: "Assignment updated successfully",
        data: updatedAssignment
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
 * /assignments/{assignmentId}:
 *   patch:
 *     tags: [Assignments]
 *     summary: Update specific assignment fields
 *     description: Update only specified fields of an assignment
 *     parameters:
 *       - in: path
 *         name: assignmentId
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
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed, cancelled]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               submittedDate:
 *                 type: string
 *                 format: date-time
 *               grade:
 *                 type: number
 *     responses:
 *       200:
 *         description: Assignment updated successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch(
  "/:assignmentId",
  [
    param("assignmentId")
      .isMongoId()
      .withMessage("Invalid assignment ID format"),
    body("title")
      .optional()
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage("Title must be between 5 and 200 characters"),
    body("content")
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage("Content must be at least 10 characters long"),
    body("status")
      .optional()
      .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
      .withMessage("Status must be pending, in-progress, completed, or cancelled"),
    body("grade")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Grade must be between 0 and 100")
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const updateFields = {};
      if (req.body.title !== undefined) updateFields.title = req.body.title;
      if (req.body.content !== undefined) updateFields.content = req.body.content;
      if (req.body.status !== undefined) updateFields.status = req.body.status;
      if (req.body.dueDate !== undefined) updateFields.dueDate = req.body.dueDate;
      if (req.body.submittedDate !== undefined) updateFields.submittedDate = req.body.submittedDate;
      if (req.body.grade !== undefined) updateFields.grade = req.body.grade;
      updateFields.updatedAt = Date.now();

      const updatedAssignment = await Assignment.findByIdAndUpdate(
        req.params.assignmentId,
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      if (!updatedAssignment) {
        return res.status(404).json({
          success: false,
          error: "Assignment not found"
        });
      }

      res.json({
        success: true,
        message: "Assignment updated successfully",
        data: updatedAssignment
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
 * /assignments/{assignmentId}:
 *   delete:
 *     tags: [Assignments]
 *     summary: Delete assignment
 *     description: Remove an assignment from the database
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment deleted successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete(
  "/:assignmentId",
  [
    param("assignmentId")
      .isMongoId()
      .withMessage("Invalid assignment ID format")
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const removedAssignment = await Assignment.findByIdAndDelete(req.params.assignmentId);

      if (!removedAssignment) {
        return res.status(404).json({
          success: false,
          error: "Assignment not found"
        });
      }

      res.json({
        success: true,
        message: "Assignment deleted successfully",
        data: removedAssignment
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
