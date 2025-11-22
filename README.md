# User Tasks REST API

A REST API built with Express.js and MySQL for managing users and tasks with role-based access control.

## Features

- **User Management**: Registration, login, and profile management
- **Task Management**: Create, list, and update tasks
- **Role-Based Access Control**: Basic and Admin roles with different permissions
- **Authentication**: JWT-based authentication
- **Pagination**: Task listing with pagination (10 items per page)
- **Sorting**: Sort tasks by newest or oldest
- **Data Validation**: Input validation for all endpoints
- **Unique Constraints**: Username and email uniqueness enforced

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Yettel_Test
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update the `.env` file with your database credentials and JWT secret:
   ```env
   PORT=3000
   NODE_ENV=development
   
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=yettel_test
   DB_USER=root
   DB_PASSWORD=your_password
   
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=24h
   ```

4. **Create MySQL database**
   ```sql
   CREATE DATABASE yettel_test;
   ```

5. **Run the application**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "role": "basic" // optional, defaults to "basic"
  }
  ```

#### Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "username": "johndoe",
    "password": "password123"
  }
  ```
- **Response:** Returns JWT token (use in Authorization header as `Bearer <token>`)

### Tasks

#### List Tasks
- **GET** `/api/tasks`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `page` (optional): Page number (default: 1)
  - `sort` (optional): `newest` or `oldest` (default: `newest`)
- **Permissions:**
  - Basic users: Only their own tasks
  - Admin users: All users' tasks

#### Create Task
- **POST** `/api/tasks`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "body": "Task description"
  }
  ```
- **Permissions:** Basic users only (Admin cannot create tasks)

#### Update Task
- **PUT** `/api/tasks/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "body": "Updated task description"
  }
  ```
- **Permissions:**
  - Basic users: Only their own tasks
  - Admin users: Any task

### Users

#### Get Own Profile
- **GET** `/api/users/me`
- **Headers:** `Authorization: Bearer <token>`
- **Permissions:** All authenticated users

#### Update Own Profile
- **PUT** `/api/users/me`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** (all fields optional)
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "newpassword123"
  }
  ```
- **Permissions:** All authenticated users

#### Update Any User Profile (Admin Only)
- **PUT** `/api/users/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** (all fields optional)
  ```json
  {
    "firstName": "Jane",
    "lastName": "Smith",
    "username": "janesmith",
    "email": "jane@example.com",
    "password": "newpassword123",
    "role": "admin"
  }
  ```
- **Permissions:** Admin users only

## Permissions Summary

### Basic Role
- ✅ Create tasks
- ✅ List own tasks
- ✅ Update own tasks
- ✅ View own profile
- ✅ Update own profile
- ❌ Cannot create tasks as admin
- ❌ Cannot view/update other users' tasks
- ❌ Cannot update other users' profiles

### Admin Role
- ❌ Cannot create tasks
- ✅ List all users' tasks
- ✅ Update any task
- ✅ View own profile
- ✅ Update own profile
- ✅ Update any user's profile

## Testing with Postman

1. Import the Postman collection JSON file (to be created after testing)
2. Set up environment variables in Postman:
   - `base_url`: `http://localhost:3000`
   - `token`: (will be set automatically after login)
3. Run the requests in order:
   - Register a user
   - Login to get token
   - Test task endpoints
   - Test user endpoints

## Error Responses

All error responses follow this format:
```json
{
  "error": "Error message"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate username/email)
- `500`: Internal Server Error

## Database Schema

### Users Table
- `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
- `firstName` (STRING, NOT NULL)
- `lastName` (STRING, NOT NULL)
- `username` (STRING, UNIQUE, NOT NULL)
- `email` (STRING, UNIQUE, NOT NULL)
- `password` (STRING, NOT NULL, HASHED)
- `role` (ENUM: 'basic', 'admin', DEFAULT: 'basic')
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

### Tasks Table
- `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
- `body` (TEXT, NOT NULL)
- `userId` (INTEGER, FOREIGN KEY → Users.id)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

## Security Features

- Password hashing using bcrypt (10 salt rounds)
- JWT token authentication
- Input validation and sanitization
- SQL injection prevention (Sequelize ORM)
- Unique constraints on username and email

## License

ISC

## Author

Luka Labalo

