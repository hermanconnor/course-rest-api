# 📚 Course REST API (Rebuilt in TypeScript with Hono + Drizzle)

A simple yet modern RESTful API for managing users and courses, originally built during my time in the [Treehouse Full-Stack JavaScript Techdegree](https://teamtreehouse.com/techdegree/full-stack-javascript) — now completely rebuilt from scratch using **TypeScript**, **Hono**, **SQLite**, and **Drizzle ORM**! 🚀

## 📷 Screenshots

![Course REST API](./screenshot.png)

## ✨ Tech Stack

- TypeScript
- Hono
- Drizzle ORM
- SQLite
- Zod
- Auth Custom middleware w/ Basic Auth

## 🧠 Features

- 👤 User registration and authentication
- 🔐 Basic authentication middleware
- 📘 Full CRUD for courses (only by the course owner)
- 🧪 Schema validation with Zod
- 🧼 Clear structure with clean error handling (`AppError`)
- 🧩 Modular service layer (e.g., `UserService`, `CourseService`)

## 🔐 Authentication

- **Basic Auth** is used for securing routes.
- Authenticated user info is stored in Hono's context (`c.set('currentUser')`).
- Only the course creator can update or delete their course.

## 📬 API Endpoints

### 👤 Users

| Method   | Route        | Description                |
| -------- | ------------ | -------------------------- |
| `GET`    | `/users`     | Get authenticated user     |
| `POST`   | `/users`     | Register a new user        |
| `PUT`    | `/users/:id` | Update a user (owner only) |
| `DELETE` | `/users/:id` | Delete a user (owner only) |

### 📘 Courses

| Method   | Route          | Description                     |
| -------- | -------------- | ------------------------------- |
| `GET`    | `/courses`     | Get all courses                 |
| `GET`    | `/courses/:id` | Get a course by ID              |
| `POST`   | `/courses`     | Create a course (auth required) |
| `PUT`    | `/courses/:id` | Update a course (owner only)    |
| `DELETE` | `/courses/:id` | Delete a course (owner only)    |

## 🛠️ Setup Instructions

```bash
# 1. Clone the repo
git clone https://github.com/your-username/your-repo.git
cd your-repo

# 2. Install dependencies
npm install

# 3. Initialize the database
npm run db:generate
# followed by
npm run db:migrate

# Or
npx drizzle-kit push

# 4. Start the dev server
npm dev
```

> ⚠️ Make sure to configure your `.env` if needed for DB settings or secrets.

## 🧪 Validation

- Input schemas for both `User` and `Course` are defined using Zod.

## 📝 What I Learned

### 1. **Hono** 🚀

Before this project, I had never worked with **Hono**. I learned to:

- Set up API routes and handle requests efficiently.
- Manage context (e.g., `c.get('currentUser')`) and middleware.
- Implement structured responses using Hono's `json()` method.

### 2. **Drizzle ORM** 🌐

I had no prior experience with **Drizzle ORM** before this project. I learned how to:

- Define database schemas and model relationships.
- Interact with SQLite using Drizzle's lightweight and intuitive query builder.

### 3. **Creating Basic Auth Middleware** 🔐

Creating custom authentication middleware from scratch was a great learning experience. I now understand how to:

- Handle **Basic Authentication** (username/password) using headers.

- Store and retrieve authenticated user information in Hono's context.

### 4. **Structuring API Responses** 📡

A major challenge was making sure the API responses were structured and standardized. I learned how to:

- Create consistent and meaningful response objects, with `status`, `message`, and `data` keys.
- Throw and catch errors using a custom error class (`AppError`).
- Return clear, user-friendly messages for common HTTP errors (e.g., `400 Bad Request`, `404 Not Found`).

## Acknowledgments

- Thanks to the [Treehouse](https://teamtreehouse.com/) coding community for providing invaluable resources and support.
