const request = require('supertest');
const app = require('../../src/app');
const { setupTestDatabase, cleanTestDatabase, closeDatabaseConnection } = require('./setup');

describe('Users API - E2E Tests', () => {
  let basicUserToken;
  let basicUserId;
  let adminUserToken;
  let adminUserId;
  let secondBasicUserToken;
  let secondBasicUserId;

  beforeAll(async () => {
    // Setup test database
    await setupTestDatabase();

    // Register and login basic user
    const basicUser = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123'
      });
    basicUserToken = basicUser.body.token;
    basicUserId = basicUser.body.user.id;

    // Register and login second basic user
    const secondBasicUser = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'janesmith',
        email: 'jane@example.com',
        password: 'password123'
      });
    secondBasicUserToken = secondBasicUser.body.token;
    secondBasicUserId = secondBasicUser.body.user.id;

    // Register and login admin user
    const adminUser = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
    adminUserToken = adminUser.body.token;
    adminUserId = adminUser.body.user.id;
  });

  afterAll(async () => {
    await cleanTestDatabase();
    await closeDatabaseConnection();
  });

  describe('GET /api/users/me - Get Own Profile', () => {
    test('Basic user should get their own profile', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${basicUserToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        id: basicUserId,
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        role: 'basic'
      });
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('Admin user should get their own profile', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${adminUserToken}`)
        .expect(200);

      expect(response.body.user.role).toBe('admin');
    });

    test('Should fail without authentication token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .expect(401);
    });
  });

  describe('PUT /api/users/me - Update Own Profile', () => {
    test('Basic user should update their own profile', async () => {
      const updateData = {
        firstName: 'John Updated',
        lastName: 'Doe Updated'
      };

      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${basicUserToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Profile updated successfully');
      expect(response.body.user.firstName).toBe('John Updated');
      expect(response.body.user.lastName).toBe('Doe Updated');
      expect(response.body.user.username).toBe('johndoe'); // Unchanged
    });

    test('User should be able to update their username', async () => {
      const updateData = {
        username: 'johndoe_new'
      };

      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${basicUserToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.user.username).toBe('johndoe_new');
      
      // Update back for other tests
      await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${basicUserToken}`)
        .send({ username: 'johndoe' });
    });

    test('User should be able to update their password', async () => {
      const updateData = {
        password: 'newpassword123'
      };

      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${basicUserToken}`)
        .send(updateData)
        .expect(200);

      // Verify new password works by logging in
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'johndoe',
          password: 'newpassword123'
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('token');
      
      // Update password back
      await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .send({ password: 'password123' });
    });

    test('Admin should be able to update their own profile', async () => {
      const updateData = {
        firstName: 'Admin Updated'
      };

      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.user.firstName).toBe('Admin Updated');
    });

    test('Should fail with invalid email format', async () => {
      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${basicUserToken}`)
        .send({ email: 'invalid-email' })
        .expect(400);
    });

    test('Should fail without authentication token', async () => {
      const response = await request(app)
        .put('/api/users/me')
        .send({ firstName: 'Test' })
        .expect(401);
    });
  });

  describe('PUT /api/users/:id - Update Any User (Admin Only)', () => {
    test('Admin should be able to update any user profile', async () => {
      const updateData = {
        firstName: 'Admin Changed This',
        lastName: 'Changed Last Name'
      };

      const response = await request(app)
        .put(`/api/users/${basicUserId}`)
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User profile updated successfully');
      expect(response.body.user.firstName).toBe('Admin Changed This');
      expect(response.body.user.lastName).toBe('Changed Last Name');
    });

    test('Admin should be able to change user role', async () => {
      const updateData = {
        role: 'admin'
      };

      const response = await request(app)
        .put(`/api/users/${secondBasicUserId}`)
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.user.role).toBe('admin');
      
      // Change back to basic
      await request(app)
        .put(`/api/users/${secondBasicUserId}`)
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send({ role: 'basic' });
    });

    test('Admin should be able to update user password', async () => {
      const updateData = {
        password: 'adminchangedpassword'
      };

      const response = await request(app)
        .put(`/api/users/${secondBasicUserId}`)
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send(updateData)
        .expect(200);

      // Verify password was changed by logging in
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'janesmith',
          password: 'adminchangedpassword'
        })
        .expect(200);

      // Change password back
      await request(app)
        .put(`/api/users/${secondBasicUserId}`)
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send({ password: 'password123' });
    });

    test('Basic user should NOT be able to update other users', async () => {
      const response = await request(app)
        .put(`/api/users/${secondBasicUserId}`)
        .set('Authorization', `Bearer ${basicUserToken}`)
        .send({ firstName: 'Hacked' })
        .expect(403);

      expect(response.body.error).toContain('Access denied');
    });

    test('Should fail to update non-existent user', async () => {
      const response = await request(app)
        .put('/api/users/99999')
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send({ firstName: 'Test' })
        .expect(404);

      expect(response.body.error).toBe('User not found.');
    });

    test('Should fail without authentication token', async () => {
      const response = await request(app)
        .put(`/api/users/${basicUserId}`)
        .send({ firstName: 'Test' })
        .expect(401);
    });
  });
});

