# UniFlow API Endpoints Documentation

## Overview
Complete API documentation for UniFlow project management system. All endpoints require Bearer token authentication (except login/signup).

## Base URL
```
http://localhost:3000/api
```

## Authentication Header
```
Authorization: Bearer {token}
```

---

## 🔐 Authentication Endpoints

### POST /auth/signin
Sign in user and get JWT token
```json
{
  "username": "string",
  "password": "string"
}
```
**Response (201):**
```json
{
  "token": "eyJhbGc...",
  "id": 1,
  "role": "admin|manager|user",
  "fullName": "string"
}
```

### POST /auth/signup
Create new user account
```json
{
  "username": "string (min 3 chars)",
  "email": "valid@email.com",
  "password": "string (min 6 chars)",
  "fullName": "string",
  "profession": "string (optional)",
  "image": "file (optional, max 5MB, JPEG/PNG/GIF only)"
}
```

### GET /auth/signout
Logout current user (adds token to blacklist)

---

## 👥 User Endpoints

### GET /user/mydata
Get current authenticated user's data
**Response:**
```json
{
  "id": 1,
  "fullName": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "profession": "Developer",
  "photo": "images/users/abc123.jpg",
  "role": "admin|manager|user",
  "tasksDone": 5
}
```

### GET /user/:id/projects
Get all projects managed by user

### GET /user/:id/projectin
Get all projects where user is a member

### POST /user/search
Search for users by name or email
```json
{
  "query": "string"
}
```

### GET /user/achievements
Get user achievements and statistics
**Response:**
```json
{
  "tasksDone": 10,
  "tasksOnTime": 7,
  "projectsCount": 3,
  "commentsCount": 25,
  "managedProjects": 2,
  "maxTeamSize": 5,
  "completedProjects": 1,
  "role": "manager"
}
```

### GET /user/:userId/action-stats
Get user action statistics
**Response:**
```json
{
  "total": 50,
  "byState": {
    "Todo": 5,
    "Doing": 10,
    "Done": 35
  }
}
```

---

## 📊 Admin Endpoints

### GET /admin/users
Get all users with their project roles (Admin only)

### PUT /admin/users/:id/role
Update user role (Admin only)
```json
{
  "role": "manager|user"
}
```

---

## 📁 Project Endpoints

### GET /project
Get all projects (Admin/Manager) or member projects (User)

### POST /project
Create new project (Admin/Manager only)
```json
{
  "name": "string",
  "description": "string (optional)",
  "managerId": number
}
```

### GET /project/:id
Get project details

### PUT /project/:id
Update project (Admin/Manager only)
```json
{
  "name": "string (optional)",
  "description": "string (optional)"
}
```

### DELETE /project/:id
Delete project (Admin/Manager only)

### GET /project/:projectId/users
Get all project members

### GET /project/:projectId/tasks
Get all tasks in project

### POST /project/addUser
Add user to project
```json
{
  "userId": number,
  "projectId": number
}
```

### GET /project/:projectId/statistics
Get project statistics dashboard

### GET /project/:projectId/actions
Get action history for project (limited to 100 recent)

---

## ✅ Task Endpoints

### GET /task
Get all tasks with user info (requires authentication)

### POST /task
Create new task
```json
{
  "name": "string",
  "description": "string (optional)",
  "state": "Todo|Doing|Done",
  "projectId": number,
  "userId": number (optional),
  "deadline": "YYYY-MM-DD (optional)"
}
```

### PUT /task/:id
Update task (Admin/Manager can update all, User only own tasks)
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "state": "Todo|Doing|Done"
}
```
**Note:** Updating state automatically creates an Action record for history tracking

### DELETE /task/:id
Delete task (Admin/Manager/Task Owner)

### GET /task/:taskId/actions
Get task state change history
**Response:**
```json
[
  {
    "id": 1,
    "state": "Done",
    "taskId": 5,
    "userId": 2,
    "user": {
      "id": 2,
      "fullName": "Jane Doe",
      "email": "jane@example.com"
    },
    "createdAt": "2025-02-16T10:30:00Z"
  }
]
```

---

## 💬 Comment Endpoints

### GET /task/:taskId/comments
Get all comments for a task
**Response:**
```json
[
  {
    "id": 1,
    "text": "Great work!",
    "userId": 2,
    "taskId": 5,
    "user": {
      "id": 2,
      "fullName": "Jane Doe",
      "photo": "images/users/abc123.jpg"
    },
    "createdAt": "2025-02-16T10:30:00Z"
  }
]
```

### POST /task/:taskId/comments
Create comment on task
```json
{
  "text": "string (max 5000 chars)"
}
```

### DELETE /comment/:id
Delete comment (Author/Manager/Admin only)

---

## 📈 Action Endpoints (Activity History)

### GET /task/:taskId/actions
Get state change history for specific task

### GET /project/:projectId/actions
Get action history for entire project (max 100 recent)

### GET /user/:userId/action-stats
Get user's action statistics

---

## 🔒 Security Features

- ✅ JWT token authentication with 24h expiration
- ✅ Token blacklist for logout
- ✅ Role-based access control (Admin/Manager/User)
- ✅ Input validation on all endpoints
- ✅ File upload validation (type and size)
- ✅ Permission checks for resource access

---

## 📝 Error Handling

All errors return JSON with message:
```json
{
  "message": "Error description",
  "errors": [
    {
      "msg": "Specific validation error",
      "param": "field_name"
    }
  ]
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

---

## 🚀 Example Usage

### Login
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

### Get My Data
```bash
curl http://localhost:3000/api/user/mydata \
  -H "Authorization: Bearer {token}"
```

### Create Task
```bash
curl -X POST http://localhost:3000/api/task \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Setup API",
    "state": "Todo",
    "projectId": 1,
    "deadline": "2025-02-28"
  }'
```

### Get Task History
```bash
curl http://localhost:3000/api/task/1/actions \
  -H "Authorization: Bearer {token}"
```

---

## 📋 Validation Rules

### Username
- Required, minimum 3 characters
- Must be unique in database

### Email
- Required, must be valid email format
- Must be unique in database

### Password
- Required, minimum 6 characters
- Stored using bcrypt hashing

### Comment Text
- Required, maximum 5000 characters

### File Upload
- Accepted types: JPEG, PNG, GIF
- Maximum size: 5MB
- Auto-generated filename for security

### Task State
- Enum: "Todo", "Doing", "Done"
- Any state change creates Action record

---

## Last Updated
February 16, 2025

API Version: 1.0
