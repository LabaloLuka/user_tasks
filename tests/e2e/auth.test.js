const request = require('supertest');
const app = require('../../src/app');
const { setupTestDatabase, cleanTestDatabase, closeDatabaseConnection } = require('./setup');

describe('Authentication API - E2E Tests', () => {
  beforeAll(async () => {
    // Setup test database before all tests in this suite
    await setupTestDatabase();
  });

  afterAll(async () => {
    // Clean up and close connections after all tests
    await cleanTestDatabase();
    await closeDatabaseConnection();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new basic user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        role: 'basic'
      });
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should register an admin user successfully', async () => {
      const userData = {
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.user.role).toBe('admin');
      expect(response.body).toHaveProperty('token');
    });

    test('should fail with duplicate username', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        username: 'johndoe', // Already exists
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.error).toContain('Username');
    });

    test('should fail with duplicate email', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        email: 'john@example.com', // Already exists
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.error).toContain('Email');
    });

    test('should fail with invalid email format', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser2',
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
    });

    test('should fail with short password', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser3',
        email: 'test3@example.com',
        password: '12345' // Less than 6 characters
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      const loginData = {
        username: 'johndoe',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe('johndoe');
    });

    test('should fail with invalid username', async () => {
      const loginData = {
        username: 'nonexistent',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid username or password.');
    });

    test('should fail with invalid password', async () => {
      const loginData = {
        username: 'johndoe',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid username or password.');
    });

    test('should fail with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);
    });
  });
});

