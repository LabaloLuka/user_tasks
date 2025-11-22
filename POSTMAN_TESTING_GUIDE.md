# Postman Testing Guide

## Prerequisites
1. Make sure your server is running (`npm start` or `npm run dev`)
2. Make sure your MySQL database is set up and connected
3. Open Postman application

## Step-by-Step Testing

### Step 1: Create Postman Collection
1. Open Postman
2. Click "New" → "Collection"
3. Name it: "Yettel Test API"
4. Click "Create"

### Step 2: Set Up Environment Variables (Optional but Recommended)
1. Click the "Environments" icon (left sidebar)
2. Click "+" to create new environment
3. Name it: "Yettel Local"
4. Add variables:
   - `base_url` = `http://localhost:3000`
   - `token` = (leave empty, will be set automatically)
5. Click "Save"
6. Select this environment from the dropdown (top right)

### Step 3: Test Authentication Endpoints

#### 3.1 Register a Basic User
1. Create new request: "Register Basic User"
2. Method: `POST`
3. URL: `{{base_url}}/api/auth/register` (or `http://localhost:3000/api/auth/register`)
4. Headers: 
   - `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```
6. Click "Send"
7. **Expected Response (201)**: Should return token and user data
8. **Save the token**: Copy the `token` from response, we'll use it later

#### 3.2 Register an Admin User
1. Create new request: "Register Admin User"
2. Method: `POST`
3. URL: `{{base_url}}/api/auth/register`
4. Body:
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```
5. Click "Send"
6. **Save the admin token** from response

#### 3.3 Login (Basic User)
1. Create new request: "Login Basic User"
2. Method: `POST`
3. URL: `{{base_url}}/api/auth/login`
4. Body:
```json
{
  "username": "johndoe",
  "password": "password123"
}
```
5. Click "Send"
6. **Expected Response (200)**: Should return token

#### 3.4 Login (Admin User)
1. Create new request: "Login Admin User"
2. Method: `POST`
3. URL: `{{base_url}}/api/auth/login`
4. Body:
```json
{
  "username": "admin",
  "password": "admin123"
}
```
5. Click "Send"
6. **Save the admin token**

### Step 4: Test Task Endpoints (Using Basic User Token)

#### 4.1 Create Task (Basic User)
1. Create new request: "Create Task"
2. Method: `POST`
3. URL: `{{base_url}}/api/tasks`
4. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_BASIC_USER_TOKEN` (replace with actual token)
5. Body:
```json
{
  "body": "My first task"
}
```
6. Click "Send"
7. **Expected Response (201)**: Task created successfully
8. **Note the task ID** from response

#### 4.2 Create Another Task
1. Duplicate the "Create Task" request
2. Change body to:
```json
{
  "body": "My second task"
}
```
3. Click "Send"

#### 4.3 List Tasks (Basic User - Should see only own tasks)
1. Create new request: "List Tasks (Basic)"
2. Method: `GET`
3. URL: `{{base_url}}/api/tasks`
4. Headers:
   - `Authorization: Bearer YOUR_BASIC_USER_TOKEN`
5. Query Params (optional):
   - `page=1`
   - `sort=newest` (or `oldest`)
6. Click "Send"
7. **Expected Response (200)**: Should return only tasks created by this user
8. **Check pagination info** in response

#### 4.4 Update Own Task (Basic User)
1. Create new request: "Update Task"
2. Method: `PUT`
3. URL: `{{base_url}}/api/tasks/1` (replace 1 with actual task ID)
4. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_BASIC_USER_TOKEN`
5. Body:
```json
{
  "body": "Updated task content"
}
```
6. Click "Send"
7. **Expected Response (200)**: Task updated successfully

### Step 5: Test Admin Permissions

#### 5.1 List All Tasks (Admin - Should see all users' tasks)
1. Create new request: "List Tasks (Admin)"
2. Method: `GET`
3. URL: `{{base_url}}/api/tasks`
4. Headers:
   - `Authorization: Bearer YOUR_ADMIN_TOKEN`
5. Query Params:
   - `page=1`
   - `sort=newest`
6. Click "Send"
7. **Expected Response (200)**: Should return ALL tasks from all users

#### 5.2 Try to Create Task as Admin (Should Fail)
1. Create new request: "Create Task as Admin (Should Fail)"
2. Method: `POST`
3. URL: `{{base_url}}/api/tasks`
4. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_ADMIN_TOKEN`
5. Body:
```json
{
  "body": "Admin trying to create task"
}
```
6. Click "Send"
7. **Expected Response (403)**: Access denied - Admin cannot create tasks

#### 5.3 Update Any Task (Admin)
1. Create new request: "Update Any Task (Admin)"
2. Method: `PUT`
3. URL: `{{base_url}}/api/tasks/1` (use a task ID from basic user)
4. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_ADMIN_TOKEN`
5. Body:
```json
{
  "body": "Admin updated this task"
}
```
6. Click "Send"
7. **Expected Response (200)**: Task updated successfully (admin can update any task)

### Step 6: Test User/Profile Endpoints

#### 6.1 Get Own Profile (Basic User)
1. Create new request: "Get Own Profile"
2. Method: `GET`
3. URL: `{{base_url}}/api/users/me`
4. Headers:
   - `Authorization: Bearer YOUR_BASIC_USER_TOKEN`
5. Click "Send"
6. **Expected Response (200)**: Should return user profile (no password)

#### 6.2 Update Own Profile (Basic User)
1. Create new request: "Update Own Profile"
2. Method: `PUT`
3. URL: `{{base_url}}/api/users/me`
4. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_BASIC_USER_TOKEN`
5. Body:
```json
{
  "firstName": "John Updated",
  "lastName": "Doe Updated"
}
```
6. Click "Send"
7. **Expected Response (200)**: Profile updated successfully

#### 6.3 Try to Update Other User Profile as Basic (Should Fail)
1. Create new request: "Update Other User (Basic - Should Fail)"
2. Method: `PUT`
3. URL: `{{base_url}}/api/users/2` (use admin user ID)
4. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_BASIC_USER_TOKEN`
5. Body:
```json
{
  "firstName": "Hacked"
}
```
6. Click "Send"
7. **Expected Response (403)**: Access denied - Basic users cannot update other users

#### 6.4 Update Any User Profile (Admin)
1. Create new request: "Update Any User (Admin)"
2. Method: `PUT`
3. URL: `{{base_url}}/api/users/1` (use basic user ID)
4. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_ADMIN_TOKEN`
5. Body:
```json
{
  "firstName": "Admin Changed This",
  "role": "admin"
}
```
6. Click "Send"
7. **Expected Response (200)**: User profile updated successfully

### Step 7: Test Error Cases

#### 7.1 Register with Duplicate Username (Should Fail)
1. Use "Register Basic User" request
2. Try to register with same username: "johndoe"
3. **Expected Response (409)**: Username already exists

#### 7.2 Register with Duplicate Email (Should Fail)
1. Use "Register Basic User" request
2. Try to register with same email: "john@example.com"
3. **Expected Response (409)**: Email already exists

#### 7.3 Access Protected Route Without Token (Should Fail)
1. Create new request: "List Tasks Without Token"
2. Method: `GET`
3. URL: `{{base_url}}/api/tasks`
4. **Don't add Authorization header**
5. Click "Send"
6. **Expected Response (401)**: Access denied. No token provided.

#### 7.4 Access with Invalid Token (Should Fail)
1. Create new request: "List Tasks Invalid Token"
2. Method: `GET`
3. URL: `{{base_url}}/api/tasks`
4. Headers:
   - `Authorization: Bearer invalid_token_here`
5. Click "Send"
6. **Expected Response (401)**: Invalid token

#### 7.5 Update Non-Existent Task (Should Fail)
1. Create new request: "Update Non-Existent Task"
2. Method: `PUT`
3. URL: `{{base_url}}/api/tasks/99999`
4. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_BASIC_USER_TOKEN`
5. Body:
```json
{
  "body": "This task doesn't exist"
}
```
6. Click "Send"
7. **Expected Response (404)**: Task not found

#### 7.6 Update Other User's Task as Basic (Should Fail)
1. Create a task as admin user
2. Try to update that task as basic user
3. **Expected Response (403)**: Access denied. You can only update your own tasks.

### Step 8: Test Pagination and Sorting

#### 8.1 List Tasks - Page 1, Newest First
1. Use "List Tasks" request
2. Query Params:
   - `page=1`
   - `sort=newest`
3. **Expected**: Tasks sorted by createdAt DESC

#### 8.2 List Tasks - Page 1, Oldest First
1. Use "List Tasks" request
2. Query Params:
   - `page=1`
   - `sort=oldest`
3. **Expected**: Tasks sorted by createdAt ASC

#### 8.3 Test Pagination (Create more than 10 tasks to test)
1. Create 15 tasks
2. List tasks with `page=1` - should return first 10
3. List tasks with `page=2` - should return next 5
4. Check `hasNextPage` and `hasPrevPage` in response

## Testing Checklist

- [ ] Register basic user
- [ ] Register admin user
- [ ] Login basic user
- [ ] Login admin user
- [ ] Create task (basic user)
- [ ] List own tasks (basic user)
- [ ] Update own task (basic user)
- [ ] List all tasks (admin)
- [ ] Try to create task as admin (should fail)
- [ ] Update any task (admin)
- [ ] Get own profile
- [ ] Update own profile
- [ ] Try to update other user as basic (should fail)
- [ ] Update any user (admin)
- [ ] Test duplicate username/email (should fail)
- [ ] Test without token (should fail)
- [ ] Test with invalid token (should fail)
- [ ] Test pagination
- [ ] Test sorting (newest/oldest)

## Exporting Postman Collection

Once all tests are done:
1. Click on your collection name
2. Click the "..." (three dots) menu
3. Select "Export"
4. Choose "Collection v2.1"
5. Save as `Yettel_Test_API.postman_collection.json`

