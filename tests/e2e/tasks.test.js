const request = require('supertest');
const app = require('../../src/app');
const { setupTestDatabase, cleanTestDatabase, closeDatabaseConnection } = require('./setup');

describe('Tasks API - E2E Tests', () => {
  let basicUserToken;
  let basicUserId;
  let adminUserToken;
  let adminUserId;
  let secondBasicUserToken;
  let secondBasicUserId;
  let taskId1;
  let taskId2;

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

  describe('POST /api/tasks - Create Task', () => {
    test('Basic user should create a task successfully', async () => {
      const taskData = {
        body: 'My first task'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${basicUserToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Task created successfully');
      expect(response.body.task).toMatchObject({
        body: 'My first task',
        userId: basicUserId
      });
      expect(response.body.task).toHaveProperty('id');
      expect(response.body.task).toHaveProperty('createdAt');
      
      taskId1 = response.body.task.id;
    });

    test('Basic user should create another task', async () => {
      const taskData = {
        body: 'My second task'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${basicUserToken}`)
        .send(taskData)
        .expect(201);

      taskId2 = response.body.task.id;
      expect(response.body.task.body).toBe('My second task');
    });

    test('Admin should NOT be able to create a task', async () => {
      const taskData = {
        body: 'Admin trying to create task'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send(taskData)
        .expect(403);

      expect(response.body.error).toContain('Access denied');
    });

    test('Should fail without authentication token', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ body: 'Test task' })
        .expect(401);

      expect(response.body.error).toContain('token');
    });

    test('Should fail with invalid task body', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${basicUserToken}`)
        .send({ body: '' })
        .expect(400);
    });
  });

  describe('GET /api/tasks - List Tasks', () => {
    test('Basic user should see only their own tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${basicUserToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('tasks');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.tasks)).toBe(true);
      
      // Should only see tasks created by this user
      response.body.tasks.forEach(task => {
        expect(task.userId).toBe(basicUserId);
      });
      
      expect(response.body.pagination).toMatchObject({
        currentPage: 1,
        totalTasks: expect.any(Number),
        limit: 10
      });
    });

    test('Admin should see all tasks from all users', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${adminUserToken}`)
        .expect(200);

      expect(response.body.tasks.length).toBeGreaterThanOrEqual(2);
      
      // Should see tasks from different users
      const userIds = [...new Set(response.body.tasks.map(t => t.userId))];
      expect(userIds.length).toBeGreaterThanOrEqual(1);
    });

    test('Should support pagination', async () => {
      const response = await request(app)
        .get('/api/tasks?page=1')
        .set('Authorization', `Bearer ${basicUserToken}`)
        .expect(200);

      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    test('Should sort tasks by newest first (default)', async () => {
      const response = await request(app)
        .get('/api/tasks?sort=newest')
        .set('Authorization', `Bearer ${basicUserToken}`)
        .expect(200);

      if (response.body.tasks.length > 1) {
        const dates = response.body.tasks.map(t => new Date(t.createdAt));
        for (let i = 0; i < dates.length - 1; i++) {
          expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i + 1].getTime());
        }
      }
    });

    test('Should sort tasks by oldest first', async () => {
      const response = await request(app)
        .get('/api/tasks?sort=oldest')
        .set('Authorization', `Bearer ${basicUserToken}`)
        .expect(200);

      if (response.body.tasks.length > 1) {
        const dates = response.body.tasks.map(t => new Date(t.createdAt));
        for (let i = 0; i < dates.length - 1; i++) {
          expect(dates[i].getTime()).toBeLessThanOrEqual(dates[i + 1].getTime());
        }
      }
    });

    test('Should fail without authentication token', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(401);
    });
  });

  describe('PUT /api/tasks/:id - Update Task', () => {
    test('Basic user should update their own task', async () => {
      const updateData = {
        body: 'Updated task content'
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId1}`)
        .set('Authorization', `Bearer ${basicUserToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Task updated successfully');
      expect(response.body.task.body).toBe('Updated task content');
      expect(response.body.task.id).toBe(taskId1);
    });

    test('Admin should be able to update any task', async () => {
      const updateData = {
        body: 'Admin updated this task'
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId1}`)
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.task.body).toBe('Admin updated this task');
    });

    test('Basic user should NOT be able to update another user\'s task', async () => {
      // Create a task as second basic user
      const taskResponse = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${secondBasicUserToken}`)
        .send({ body: 'Second user task' });
      
      const otherUserTaskId = taskResponse.body.task.id;

      // Try to update it as first basic user
      const response = await request(app)
        .put(`/api/tasks/${otherUserTaskId}`)
        .set('Authorization', `Bearer ${basicUserToken}`)
        .send({ body: 'Trying to update other user task' })
        .expect(403);

      expect(response.body.error).toContain('Access denied');
    });

    test('Should fail to update non-existent task', async () => {
      const response = await request(app)
        .put('/api/tasks/99999')
        .set('Authorization', `Bearer ${basicUserToken}`)
        .send({ body: 'Non-existent task' })
        .expect(404);

      expect(response.body.error).toBe('Task not found.');
    });

    test('Should fail without authentication token', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId1}`)
        .send({ body: 'Test' })
        .expect(401);
    });
  });
});

