const express = require("express");
const router = express.Router();
const { body, param, validationResult } = require("express-validator");
const users = require("../models/users");

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
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     description: Retrieve a list of all users in the database
 *     responses:
 *       200:
 *         description: Successfully retrieved all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/", async (req, res) => {
  try {
    const allUsers = await users.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: allUsers.length,
      data: allUsers
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
 * /users/{userId}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     description: Retrieve a specific user by their MongoDB ObjectId
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *     responses:
 *       200:
 *         description: Successfully retrieved user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  "/:userId",
  [
    param("userId")
      .isMongoId()
      .withMessage("Invalid user ID format")
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const specificUser = await users.findById(req.params.userId);
      
      if (!specificUser) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }

      res.json({
        success: true,
        data: specificUser
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
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     description: Create a new user with validation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - picture
 *             properties:
 *               first_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: John
 *               last_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: Doe
 *               picture:
 *                 type: string
 *                 example: https://example.com/photo.jpg
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                   example: User created successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  "/",
  [
    body("first_name")
      .trim()
      .notEmpty()
      .withMessage("First name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),
    body("last_name")
      .trim()
      .notEmpty()
      .withMessage("Last name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),
    body("picture")
      .trim()
      .notEmpty()
      .withMessage("Picture URL is required"),
    body("email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("Must be a valid email address")
      .normalizeEmail()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const user_obj = new users({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        picture: req.body.picture,
        email: req.body.email
      });

      const savedUser = await user_obj.save();
      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: savedUser
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
 * /users/{userId}:
 *   put:
 *     tags: [Users]
 *     summary: Update entire user (replace all fields)
 *     description: Replace all user fields with new values
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - picture
 *             properties:
 *               first_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               last_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               picture:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put(
  "/:userId",
  [
    param("userId")
      .isMongoId()
      .withMessage("Invalid user ID format"),
    body("first_name")
      .trim()
      .notEmpty()
      .withMessage("First name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),
    body("last_name")
      .trim()
      .notEmpty()
      .withMessage("Last name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),
    body("picture")
      .trim()
      .notEmpty()
      .withMessage("Picture URL is required"),
    body("email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("Must be a valid email address")
      .normalizeEmail()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const updatedUser = await users.findByIdAndUpdate(
        req.params.userId,
        {
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          picture: req.body.picture,
          email: req.body.email,
          updatedAt: Date.now()
        },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }

      res.json({
        success: true,
        message: "User updated successfully",
        data: updatedUser
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
 * /users/{userId}:
 *   patch:
 *     tags: [Users]
 *     summary: Update specific user fields (partial update)
 *     description: Update only specified fields of a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               last_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               picture:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch(
  "/:userId",
  [
    param("userId")
      .isMongoId()
      .withMessage("Invalid user ID format"),
    body("first_name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),
    body("last_name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),
    body("picture")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Picture URL cannot be empty"),
    body("email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("Must be a valid email address")
      .normalizeEmail()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const updateFields = {};
      if (req.body.first_name) updateFields.first_name = req.body.first_name;
      if (req.body.last_name) updateFields.last_name = req.body.last_name;
      if (req.body.picture) updateFields.picture = req.body.picture;
      if (req.body.email) updateFields.email = req.body.email;
      updateFields.updatedAt = Date.now();

      const updatedUser = await users.findByIdAndUpdate(
        req.params.userId,
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }

      res.json({
        success: true,
        message: "User updated successfully",
        data: updatedUser
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
 * /users/{userId}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user
 *     description: Remove a user from the database
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete(
  "/:userId",
  [
    param("userId")
      .isMongoId()
      .withMessage("Invalid user ID format")
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const removedUser = await users.findByIdAndDelete(req.params.userId);

      if (!removedUser) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }

      res.json({
        success: true,
        message: "User deleted successfully",
        data: removedUser
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
