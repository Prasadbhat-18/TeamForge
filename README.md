# TaskForge

> A full-stack project management application with Kanban boards, drag-and-drop task management, team collaboration, and activity feeds - built with the MERN stack.

**Live Demo:** [https://teamforge00.netlify.app](https://teamforge00.netlify.app)
**Backend API:** [https://teamforge-1-qvya.onrender.com](https://teamforge-1-qvya.onrender.com)

---

## Project Description

TaskForge is a collaborative project management tool that lets teams organize work visually using Kanban boards. Each project has its own board with four columns - **Backlog**, **In Progress**, **In Review**, and **Done** - where tasks can be dragged between columns with changes saved to the database instantly. Team members can be added to projects, tasks can be assigned to individuals with priorities and due dates, and every action is logged in a live activity feed.

---

## Features

- **Kanban Board with Drag-and-Drop** - move tasks across status columns with instant database persistence
- **Project Management** - create and delete projects; each project has its own isolated board, team, and activity log
- **Task CRUD** - create, edit, and delete tasks with a full dialog: title, description, priority (Low / Medium / High / Critical), status, assignee, and due date
- **Search and Filters** - filter the board by keyword, priority, or assignee above the columns
- **Team Management** - add and remove members from a project; only members can access the board
- **Activity Feed** - every task change and membership update is logged inside the project's Activity tab
- **Dashboard** - personal view showing total projects, open tasks, overdue tasks, and tasks assigned to you
- **Authentication** - JWT-based register/login with protected routes
- **Mobile-Responsive Layout** - full usability on phones and tablets via Tailwind CSS

---

## Technologies Used

### Frontend

| Technology | Purpose |
|---|---|
| React 18 | UI component library |
| Vite 5 | Build tool and dev server |
| Tailwind CSS 3 | Utility-first styling |
| @hello-pangea/dnd | Drag-and-drop for the Kanban board |
| React Hook Form + Zod | Form handling and validation |
| Axios | HTTP client with JWT interceptors |
| React Router DOM v6 | Client-side routing |
| Radix UI | Accessible dialog, dropdown, tab primitives |
| Sonner | Toast notifications |
| Lucide React | Icon set |

### Backend

| Technology | Purpose |
|---|---|
| Node.js + Express 4 | REST API server |
| MongoDB + Mongoose 8 | Database and ODM |
| JSON Web Tokens (JWT) | Authentication |
| bcryptjs | Password hashing |
| Helmet | HTTP security headers |
| CORS | Cross-origin request handling |
| Zod | Server-side request validation |
| express-rate-limit | API rate limiting |

---

## Setup and Installation

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **MongoDB** - [Atlas free tier](https://www.mongodb.com/atlas) or a local MongoDB instance

### 1. Clone the repository

```bash
git clone https://github.com/Prasadbhat-18/TeamForge.git
cd TeamForge/taskforge
```

### 2. Install all dependencies

```bash
npm install
npm install --prefix client
npm install --prefix server
```

### 3. Configure the server environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/taskforge?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
CLIENT_URL=http://localhost:5173
```

### 4. Configure the client environment

```bash
echo VITE_API_URL=http://localhost:5000 > client/.env
```

### 5. Seed the database (optional)

Creates two demo users and a sample project with tasks:

```bash
npm run seed
```

---

## How to Run the Application

### Development mode (both servers together)

```bash
npm run dev
```

- Frontend: **http://localhost:5173**
- Backend API: **http://localhost:5000**

Vite proxies all `/api` requests to Express, so there are no CORS issues in development.

### Run servers individually

```bash
# Backend only
cd server && npm run dev

# Frontend only
cd client && npm run dev
```

### Production build

```bash
cd client && npm run build
```

The output lands in `client/dist`. Deploy that folder to any static host (Vercel, Netlify) and point `VITE_API_URL` at your deployed Express server.

---

## Demo Credentials

Try the live app at **[https://teamforge00.netlify.app](https://teamforge00.netlify.app)** using these credentials:

```
Email:    demo1@taskforge.dev
Password: Demo@1234

Email:    demo2@taskforge.dev
Password: Demo@1234
```

---

## AI Tool Used - Kiro

This project was built using **[Kiro](https://kiro.dev)**, an AI-powered development environment built on VS Code. Kiro is an agentic coding assistant that can read and write files, run terminal commands, and work autonomously through complex multi-step tasks.

---

## AI Development Experience

Kiro was used throughout the entire development lifecycle - from initial scaffolding to debugging and documentation. Rather than just suggesting code snippets, Kiro acted as a full development partner: it read the existing codebase, made decisions about architecture, implemented features end-to-end, ran builds to verify correctness, and fixed errors it discovered along the way.

### Specific tasks where Kiro was used

**1. Full-Stack Application Scaffolding**
Kiro generated the entire initial project structure from scratch - the Express server with MongoDB connection, Mongoose models (`User`, `Project`, `Task`, `Activity`), JWT authentication middleware, Zod validation schemas, and the React frontend with Vite, Tailwind CSS, and React Router. It wired all the layers together and ensured the API and client were correctly connected from the start.

**2. Kanban Board and Drag-and-Drop Implementation**
Kiro implemented the complete Kanban board component using `@hello-pangea/dnd`. This included the `DragDropContext`, `Droppable` column containers, and `Draggable` task cards. It also wrote the `PATCH /api/tasks/:id/status` endpoint on the backend and connected the drag-end handler to optimistically update the UI while persisting the new status to MongoDB - with snapshot-based rollback on failure.

**3. API Development and Database Integration**
Kiro created all REST API endpoints across auth, projects, tasks, activity, and dashboard resources. It wrote the Mongoose aggregation pipeline in `projectController` to count tasks per project and attach those counts to project cards - a non-trivial query that joins the `tasks` collection against each project. It also built the activity logging system that automatically records every task mutation and membership change.

**4. Debugging and Crash Fixes**
When the application was crashing on startup, Kiro diagnosed the root causes by reading all key files, identifying broken imports, incorrect middleware ordering, and missing environment variable guards. It fixed a duplicate Tailwind class conflict on the board's search wrapper, corrected the modal dismissal order in the delete-project handler (ensuring `setDeleteConfirm(false)` fires before `navigate()`), and resolved a series of runtime errors - then verified the fix by running `vite build` to confirm zero errors before committing.

**5. Component Development - Task Dialog and Project Cards**
Kiro built the full task create/edit dialog using React Hook Form and Zod for client-side validation. The dialog handles both create and edit modes from a single component, populates all fields (title, description, priority, assignee, due date, status) from existing task data when editing, and calls the correct API endpoint based on mode. It also added task count chips to project cards using data from the server aggregation, and built the delete-project confirmation modal with proper state management.

---

## Project Structure

```
taskforge/
├── client/                   # Vite + React frontend
│   ├── src/
│   │   ├── api/              # Axios wrappers per resource
│   │   ├── components/       # Board, TaskDialog, Layout, ProtectedRoute
│   │   ├── context/          # AuthContext (JWT storage + user state)
│   │   ├── lib/              # axios.js (interceptors), utils.js
│   │   └── pages/            # DashboardPage, ProjectsPage, ProjectDetailPage
│   └── vite.config.js
├── server/                   # Express + Mongoose backend
│   └── src/
│       ├── controllers/      # projectController, taskController, authController
│       ├── middleware/        # authMiddleware, errorHandler, validate, projectAccess
│       ├── models/           # Project, Task, User, Activity
│       ├── routes/           # projects, tasks, auth, dashboard, activity
│       ├── scripts/          # seed.js
│       └── validators/       # Zod schemas
├── package.json              # Root: concurrently dev script
└── README.md
```

---

## API Reference

All endpoints except `/api/auth/*` require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new account |
| `POST` | `/api/auth/login` | Log in, receive a JWT |
| `GET` | `/api/projects` | List projects for the current user |
| `POST` | `/api/projects` | Create a project |
| `GET` | `/api/projects/:id` | Get project details with members |
| `DELETE` | `/api/projects/:id` | Delete project and all its tasks |
| `POST` | `/api/projects/:id/members` | Add a member by email |
| `DELETE` | `/api/projects/:id/members` | Remove a member by userId |
| `GET` | `/api/projects/:id/tasks` | List tasks for a project |
| `POST` | `/api/projects/:id/tasks` | Create a task |
| `PUT` | `/api/tasks/:id` | Update a task |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `PATCH` | `/api/tasks/:id/status` | Update task status (drag-and-drop) |
| `GET` | `/api/projects/:id/activity` | Fetch project activity log |
| `GET` | `/api/dashboard` | Get personal stats and assigned tasks |
