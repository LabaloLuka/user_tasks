const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Yettel Test API',
      version: '1.0.0',
      description: 'REST API for User and Task management with role-based access control',
      contact: {
        name: 'Luka Labalo',
        email: 'luka@example.com'
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
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from /api/auth/login or /api/auth/register'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['firstName', 'lastName', 'username', 'email', 'password'],
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
              example: 1
            },
            firstName: {
              type: 'string',
              description: 'User first name',
              example: 'John'
            },
            lastName: {
              type: 'string',
              description: 'User last name',
              example: 'Doe'
            },
            username: {
              type: 'string',
              description: 'Unique username',
              example: 'johndoe',
              minLength: 3,
              maxLength: 50
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john@example.com'
            },
            role: {
              type: 'string',
              enum: ['basic', 'admin'],
              description: 'User role',
              example: 'basic',
              default: 'basic'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update timestamp'
            }
          }
        },
        Task: {
          type: 'object',
          required: ['body'],
          properties: {
            id: {
              type: 'integer',
              description: 'Task ID',
              example: 1
            },
            body: {
              type: 'string',
              description: 'Task content',
              example: 'Complete the project documentation'
            },
            userId: {
              type: 'integer',
              description: 'ID of the user who owns this task',
              example: 1
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Task creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Task last update timestamp'
            },
            user: {
              $ref: '#/components/schemas/User',
              description: 'User who owns this task'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'username', 'email', 'password'],
          properties: {
            firstName: {
              type: 'string',
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            },
            username: {
              type: 'string',
              example: 'johndoe',
              minLength: 3,
              maxLength: 50
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password123',
              minLength: 6
            },
            role: {
              type: 'string',
              enum: ['basic', 'admin'],
              example: 'basic',
              default: 'basic'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              example: 'johndoe'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password123'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Login successful'
            },
            token: {
              type: 'string',
              description: 'JWT token for authentication',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        TaskListResponse: {
          type: 'object',
          properties: {
            tasks: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Task'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                currentPage: {
                  type: 'integer',
                  example: 1
                },
                totalPages: {
                  type: 'integer',
                  example: 5
                },
                totalTasks: {
                  type: 'integer',
                  example: 47
                },
                limit: {
                  type: 'integer',
                  example: 10
                },
                hasNextPage: {
                  type: 'boolean',
                  example: true
                },
                hasPrevPage: {
                  type: 'boolean',
                  example: false
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Error message'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoint'
      },
      {
        name: 'Authentication',
        description: 'User registration and login endpoints'
      },
      {
        name: 'Tasks',
        description: 'Task management endpoints'
      },
      {
        name: 'Users',
        description: 'User profile management endpoints'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js', './src/app.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

