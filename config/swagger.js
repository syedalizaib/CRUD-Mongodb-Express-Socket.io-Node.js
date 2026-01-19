const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CRUD API with MongoDB, Express, Socket.io & Node.js',
      version: '2.0.0',
      description: 'A comprehensive REST API demonstrating CRUD operations with MongoDB, Express.js, Socket.io, and Node.js. This API includes user management, todo lists, and assignment tracking with real-time Socket.io functionality.',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.production.com',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Users',
        description: 'User management endpoints'
      },
      {
        name: 'Todos',
        description: 'Todo list management endpoints'
      },
      {
        name: 'Assignments',
        description: 'Assignment tracking endpoints'
      }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['first_name', 'last_name', 'picture'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated MongoDB ID'
            },
            first_name: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'User first name'
            },
            last_name: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'User last name'
            },
            picture: {
              type: 'string',
              description: 'URL to user profile picture'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Todo: {
          type: 'object',
          required: ['title'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated MongoDB ID'
            },
            title: {
              type: 'string',
              minLength: 3,
              maxLength: 200,
              description: 'Todo title'
            },
            description: {
              type: 'string',
              maxLength: 1000,
              description: 'Todo description'
            },
            complete: {
              type: 'boolean',
              default: false,
              description: 'Completion status'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              default: 'medium',
              description: 'Todo priority level'
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Due date for the todo'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Assignment: {
          type: 'object',
          required: ['title', 'content', 'dueDate'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated MongoDB ID'
            },
            title: {
              type: 'string',
              minLength: 5,
              maxLength: 200,
              description: 'Assignment title'
            },
            content: {
              type: 'string',
              minLength: 10,
              description: 'Assignment content/description'
            },
            status: {
              type: 'string',
              enum: ['pending', 'in-progress', 'completed', 'cancelled'],
              default: 'pending',
              description: 'Assignment status'
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Assignment due date'
            },
            submittedDate: {
              type: 'string',
              format: 'date-time',
              description: 'Submission date'
            },
            grade: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Assignment grade (0-100)'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  msg: {
                    type: 'string'
                  },
                  param: {
                    type: 'string'
                  },
                  location: {
                    type: 'string'
                  }
                }
              },
              description: 'Validation errors'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      },
      responses: {
        BadRequest: {
          description: 'Bad request - Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js', './app.js']
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'CRUD API Documentation',
    explorer: true
  }));
  
  // Serve swagger spec as JSON
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

module.exports = setupSwagger;
