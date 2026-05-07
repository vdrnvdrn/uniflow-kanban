# Документация API UniFlow

## Обзор

Полная документация API системы управления проектами UniFlow. Все endpoints требуют Bearer token аутентификации (кроме login/signup).

## Базовый URL

```
http://localhost:3000/api
```

## Заголовок аутентификации

```
Authorization: Bearer {token}
```

---

## 🔐 Аутентификация

### POST /auth/signin

Вход в систему и получение JWT токена

```json
{
  "username": "string",
  "password": "string"
}
```

**Ответ (201):**

```json
{
  "token": "eyJhbGc...",
  "id": 1,
  "role": "admin|manager|user",
  "fullName": "string"
}
```

### POST /auth/signup

Регистрация нового пользователя

```json
{
  "username": "string (минимум 3 символа)",
  "email": "valid@email.com",
  "password": "string (минимум 6 символов)",
  "fullName": "string",
  "profession": "string (опционально)",
  "image": "file (опционально, максимум 5MB, JPEG/PNG/GIF)"
}
```

### GET /auth/signout

Выход из системы (добавляет токен в черный список)

---

## 👥 Пользователи

### GET /user/mydata

Получить данные текущего авторизованного пользователя

**Ответ:**

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

Получить все проекты, которыми управляет пользователь

### GET /user/:id/projectin

Получить все проекты, где пользователь является участником

### POST /user/search

Поиск пользователей по имени или email

```json
{
  "query": "string"
}
```

### GET /user/achievements

Получить достижения и статистику пользователя

**Ответ:**

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

Получить статистику действий пользователя

**Ответ:**

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

Получить всех пользователей с их ролями в проектах (только Admin)

### PUT /admin/users/:id/role

Обновить роль пользователя (только Admin)

```json
{
  "role": "manager|user"
}
```

---

## 📁 Проекты

### GET /project

Получить все проекты (Admin/Manager) или проекты-участника (User)

### POST /project

Создать новый проект (только Admin/Manager)

```json
{
  "name": "string",
  "description": "string (опционально)",
  "managerId": number
}
```

### GET /project/:id

Получить детали проекта

### PUT /project/:id

Обновить проект (только Admin/Manager)

```json
{
  "name": "string (опционально)",
  "description": "string (опционально)"
}
```

### DELETE /project/:id

Удалить проект (только Admin/Manager)

### GET /project/:projectId/users

Получить всех участников проекта

### GET /project/:projectId/tasks

Получить все задачи проекта

### POST /project/addUser

Добавить пользователя в проект

```json
{
  "userId": number,
  "projectId": number
}
```

### GET /project/:projectId/statistics

Получить дашборд статистики проекта

### GET /project/:projectId/actions

Получить историю действий проекта (последние 100)

---

## ✅ Задачи

### GET /task

Получить все задачи с информацией о пользователях (требуется аутентификация)

### POST /task

Создать новую задачу

```json
{
  "name": "string",
  "description": "string (опционально)",
  "state": "Todo|Doing|Done",
  "projectId": number,
  "userId": number (опционально),
  "deadline": "YYYY-MM-DD (опционально)"
}
```

### PUT /task/:id

Обновить задачу (Admin/Manager могут обновлять все, User только свои)

```json
{
  "name": "string (опционально)",
  "description": "string (опционально)",
  "state": "Todo|Doing|Done"
}
```

**Примечание:** Обновление статуса автоматически создаёт запись Action для истории

### DELETE /task/:id

Удалить задачу (Admin/Manager/Владелец задачи)

### GET /task/:taskId/actions

Получить историю изменений статуса задачи

**Ответ:**

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

## 💬 Комментарии

### GET /task/:taskId/comments

Получить все комментарии к задаче

**Ответ:**

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

Создать комментарий к задаче

```json
{
  "text": "string (максимум 5000 символов)"
}
```

### DELETE /comment/:id

Удалить комментарий (только Автор/Manager/Admin)

---

## 📈 Действия (История активности)

### GET /task/:taskId/actions

Получить историю изменений статуса конкретной задачи

### GET /project/:projectId/actions

Получить историю действий всего проекта (максимум 100 последних)

### GET /user/:userId/action-stats

Получить статистику действий пользователя

---

## 🔒 Меры безопасности

- ✅ JWT аутентификация (токены сроком 24 часа)
- ✅ Чёрный список токенов для выхода
- ✅ Ролевой доступ (Admin/Manager/User)
- ✅ Валидация входных данных на всех endpoints
- ✅ Валидация загружаемых файлов (тип и размер)
- ✅ Проверка прав доступа к ресурсам

---

## 📝 Обработка ошибок

Все ошибки возвращаются в формате JSON с сообщением:

```json
{
  "message": "Описание ошибки",
  "errors": [
    {
      "msg": "Конкретная ошибка валидации",
      "param": "field_name"
    }
  ]
}
```

Распространённые HTTP статусы:

- `200` — Успешно
- `201` — Создано
- `400` — Неверный запрос (ошибка валидации)
- `401` — Не авторизован (отсутствует/неверный токен)
- `403` — Доступ запрещён (недостаточно прав)
- `404` — Не найдено
- `500` — Ошибка сервера

---

## 🚀 Примеры использования

### Вход в систему

```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

### Получить мои данные

```bash
curl http://localhost:3000/api/user/mydata \
  -H "Authorization: Bearer {token}"
```

### Создать задачу

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

### Получить историю задачи

```bash
curl http://localhost:3000/api/task/1/actions \
  -H "Authorization: Bearer {token}"
```

---

## 📋 Правила валидации

### Имя пользователя (Username)

- Обязательное, минимум 3 символа
- Должно быть уникальным в базе данных

### Email

- Обязательное, должен быть валидным форматом email
- Должен быть уникальным в базе данных

### Пароль

- Обязательное, минимум 6 символов
- Хранится с использованием bcrypt хеширования

### Текст комментария

- Обязательное, максимум 5000 символов

### Загрузка файла

- Допустимые типы: JPEG, PNG, GIF
- Максимальный размер: 5MB
- Автоматически генерируется имя файла для безопасности

### Статус задачи

- Enum: "Todo", "Doing", "Done"
- Любое изменение статуса создаёт запись Action

---
