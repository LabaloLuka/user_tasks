# E2E Testing Guide

## Setup

### 1. Create Test Database

Create a separate test database in MySQL:

```sql
CREATE DATABASE yettel_test_test;
```

### 2. Configure Environment

Add to your `.env` file (optional):

```env
DB_NAME_TEST=yettel_test_test
```

If not specified, the test will default to `yettel_test_test`.

### 3. Install Dependencies

```bash
npm install
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## Test Structure

- `setup.js` - Database setup and teardown
- `auth.test.js` - Authentication endpoints (register, login)
- `tasks.test.js` - Task management endpoints (create, list, update)
- `users.test.js` - User profile endpoints (get, update)

## Test Flow

Each test suite:
1. **beforeAll**: Sets up test database (creates tables, cleans data)
2. **Tests**: Run realistic user journeys
3. **afterAll**: Cleans database and closes connections

## Realistic User Journeys Tested

### Basic User Journey
1. Register as basic user
2. Login
3. Create tasks
4. List own tasks
5. Update own tasks
6. Update own profile

### Admin User Journey
1. Register as admin
2. Login
3. List all users' tasks
4. Update any task
5. Update any user profile

### Permission Testing
- Basic user cannot create tasks as admin
- Basic user cannot update other users' tasks
- Basic user cannot update other users' profiles
- Admin cannot create tasks
- Admin can update any task
- Admin can update any user

## Notes

- Tests use a separate test database (`yettel_test_test`)
- Database is cleaned before each test suite (not before each test)
- All P0 endpoints are covered
- Tests follow realistic user journeys

