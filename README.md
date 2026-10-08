# TaskForge

> A full-stack project management app with Kanban boards, drag-and-drop task management, team collaboration, and real-time activity feeds.

---

## Features

- **Kanban Board with Drag-and-Drop** — move tasks across columns (Backlog → In Progress → In Review → Done) with instant DB persistence powered by `@hello-pangea/dnd`
- **Project Management** — create and delete projects; each project has its own board, team, and activity feed
- **Task CRUD** — create, edit, and delete tasks with a full dialog: title, description, priority (Low / Medium / High / Critical), status, assignee, and due date
- **Team Management** — add and remove members from a project; only members can access the board
- **Activity Feed** — every task and membership change is logged and shown in the Activity tab inside a project
- **Dashboard** — personal view showing global stats (total projects, open tasks, overdue tasks) and tasks assigned to you
- **Search and Filters** — filter the board by keyword, priority, or assignee directly above the columns
- **Mobile-Responsive Layout** — Tailwind CSS responsive grid; full usability on phones and tablets

---

## Tech Stack

| Layer | Libraries & Tools |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, @hello-pangea/dnd, React Hook Form + Zod, Sonner toasts, Lucide React, Axios |
| **Backend** | Node.js + Express 4, MongoDB + Mongoose 8, JWT auth, bcryptjs, Helmet, CORS, Zod validation, express-rate-limit |

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **MongoDB** — Atlas account (free tier works) or a local MongoDB instance

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/taskforge.git
cd taskforge
```

### 2. Install all dependencies

```bash
npm install && npm install --prefix client && npm install --prefix server
```

### 3. Create the server environment file

Copy the example and fill in your values:

```bash
cp server/.env.example server/.env
```

Open `server/.env` and set:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/taskforge?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
CLIENT_URL=http://localhost:5173
```

| Variable | Description |
|---|---|
| `PORT` | Port the Express server listens on |
| `MONGO_URI` | Full MongoDB connection string (Atlas or local) |
| `JWT_SECRET` | Secret used to sign and verify JWTs — keep this long and random |
| `CLIENT_URL` | Origin of the Vite dev server — used for CORS allow-list |

### 4. Create the client environment file

```bash
echo VITE_API_URL=http://localhost:5000 > client/.env
```

### 5. Seed the database

This creates two demo users and a sample project with tasks:

```bash
npm run seed
```

### 6. Start both dev servers

```bash
npm run dev
```

The Vite dev server starts on **http://localhost:5173** and the Express API on **http://localhost:5000**. Vite proxies `/api` requests to Express so there are no CORS issues in development.

---

## Demo Credentials

```
Email:    demo1@taskforge.dev
Password: Demo@1234

Email:    demo2@taskforge.dev
Password: Demo@1234
```

---

## API Endpoints Reference

All endpoints (except auth) require an `Authorization: Bearer <token>` header.

### Auth

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new account |
| `POST` | `/api/auth/login` | Log in and receive a JWT |

### Projects

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/projects` | List all projects the authenticated user belongs to |
| `POST` | `/api/projects` | Create a new project |
| `GET` | `/api/projects/:id` | Get a single project with members |
| `PUT` | `/api/projects/:id` | Update project name / description |
| `DELETE` | `/api/projects/:id` | Delete a project and all its tasks |
| `POST` | `/api/projects/:id/members` | Add a member by email |
| `DELETE` | `/api/projects/:id/members` | Remove a member by userId |

### Tasks

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/projects/:id/tasks` | List all tasks for a project |
| `POST` | `/api/projects/:id/tasks` | Create a task in a project |
| `PUT` | `/api/tasks/:id` | Update a task (full update) |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `PATCH` | `/api/tasks/:id/status` | Update only the status (used by drag-and-drop) |

### Activity

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/projects/:id/activity` | Fetch the activity log for a project |

### Dashboard

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Returns stats and tasks assigned to the current user |

---

## Environment Variables Reference

| Name | Used In | Description |
|---|---|---|
| `PORT` | `server/.env` | Port the Express server binds to (default `5000`) |
| `MONGO_URI` | `server/.env` | MongoDB connection string |
| `JWT_SECRET` | `server/.env` | Secret for signing JWTs |
| `CLIENT_URL` | `server/.env` | Allowed CORS origin (Vite dev server URL) |
| `VITE_API_URL` | `client/.env` | Base URL the Axios client uses for API requests |

---

## Production Build

Build the React app into static files:

```bash
cd client && npm run build
```

Output is written to `client/dist`. Serve that directory with any static host (Vercel, Netlify, Render static site) and point `VITE_API_URL` at your deployed Express server.

To run the Express server in production:

```bash
cd server && node src/index.js
```

Set `NODE_ENV=production` and make sure all environment variables are configured in your host's secrets manager.

---

## Project Structure

```
taskforge/
├── client/                   # Vite + React frontend
│   ├── src/
│   │   ├── api/              # Thin Axios wrappers per resource
│   │   ├── components/       # Board, TaskDialog, Layout
│   │   ├── context/          # AuthContext (JWT storage + user state)
│   │   ├── lib/              # axios.js (interceptors), utils.js
│   │   └── pages/            # DashboardPage, ProjectsPage, ProjectDetailPage
│   └── vite.config.js
├── server/                   # Express + Mongoose backend
│   └── src/
│       ├── controllers/      # projectController, taskController, …
│       ├── middleware/        # authMiddleware, errorHandler, validate
│       ├── models/           # Project, Task, User, Activity
│       ├── routes/           # projects, tasks, auth, dashboard
│       ├── scripts/          # seed.js
│       └── validators/       # Zod schemas
├── package.json              # Root: concurrently dev script + seed script
└── README.md
```

---

## Contributing

1. Fork the repo and create a feature branch: `git checkout -b feat/your-feature`
2. Follow the existing code style — ESM imports, Tailwind utility classes, Sonner toasts for user feedback
3. Keep API calls in `client/src/api/` wrappers; keep Express handlers in `server/src/controllers/`
4. Open a pull request with a clear description of what changed and why

---

## AI Development

This project was scaffolded and developed with the assistance of **[Kiro](https://kiro.dev)**, an AI-powered development environment. Kiro generated the initial architecture, implemented features end-to-end, and wrote this documentation.
