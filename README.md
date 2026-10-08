# TaskForge

> A full-stack project management application with Kanban boards, drag-and-drop task management, team collaboration, and activity feeds - built with the MERN stack.

**Live Demo:** [https://teamforge00.netlify.app](https://teamforge00.netlify.app)
**Backend API:** [https://teamforge-1-qvya.onrender.com](https://teamforge-1-qvya.onrender.com)

> Note: The backend is hosted on Render's free tier and may take up to 60 seconds to wake on the first request. If login is slow, wait a moment and try again.

---

## Project Description

TaskForge is a collaborative project management tool that lets teams organize work visually using Kanban boards. Each project has its own board with four columns - **To Do**, **In Progress**, **Review**, and **Done** - where tasks can be dragged between columns with changes saved to the database instantly. Team members can be added to projects, tasks can be assigned to individuals with priorities and due dates, and every action is logged in a live activity feed.

---

## Features

- **Kanban Board with Drag-and-Drop** - move tasks across columns (To Do / In Progress / Review / Done) with instant database persistence
- **Project Management** - create and delete projects; each project has its own isolated board, team, and activity log
- **Task CRUD** - create, edit, and delete tasks with a full dialog: title, description, priority (Low / Medium / High), status, assignee, and due date
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
cd TeamForge
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
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/taskforge?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
CLIENT_URL=http://localhost:5173
```

### 4. Configure the client environment

```bash
cp client/.env.example client/.env
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:5000
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

In development, the client reads `VITE_API_URL` from `client/.env` and sends all API requests directly to the Express server at that address.

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

The output lands in `client/dist`. Deploy that folder to any static host (Vercel, Netlify) and set `VITE_API_URL` in the host's environment variables to point at your deployed Express server.

---

## Demo Credentials

Try the live app at **[https://teamforge00.netlify.app](https://teamforge00.netlify.app)**:

```
Email:    demo1@taskforge.dev
Password: Demo@1234

Email:    demo2@taskforge.dev
Password: Demo@1234
```

---

## Deployment

| Service | URL |
|---|---|
| Frontend (Netlify) | https://teamforge00.netlify.app |
| Backend (Render) | https://teamforge-1-qvya.onrender.com |
| Database | MongoDB Atlas |

**Frontend** is deployed on Netlify connected to the `main` branch - every push triggers an automatic redeploy. Build config is in `netlify.toml`.

**Backend** is deployed on Render as a Node.js web service. The following environment variables must be set in the Render dashboard:

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `CLIENT_URL` | Netlify frontend URL (for CORS) |
| `NODE_ENV` | Set to `production` |

---

## AI Development

This project was built primarily using **[Kiro](https://kiro.dev)**, an AI-powered development environment built on VS Code. A portion of the middle development phase used **Antigravity** when Kiro credits ran out, then development resumed in Kiro for the final features, deployment fixes, and documentation.

**Work done with Kiro:**
- Initial full-stack scaffolding (server, models, auth, React frontend)
- Kanban board with drag-and-drop and DB persistence
- Task create/edit/delete dialog
- Dashboard, activity feed, and team management features
- Deployment configuration (Netlify + Render) and CORS fixes
- Final README and documentation

**Work done with Antigravity:**
- Task filtering and search above the board
- Project cards with task count chips
- Some middleware and validation refinements

---

## AI Development Experience

Kiro acted as a full development partner throughout the project - reading the codebase, making architecture decisions, implementing features end-to-end, running builds to verify correctness, and fixing errors autonomously.

### Specific tasks where Kiro was used

**1. Full-Stack Application Scaffolding**
Kiro generated the entire initial project structure - the Express server with MongoDB connection, Mongoose models (`User`, `Project`, `Task`, `Activity`), JWT authentication middleware, Zod validation schemas, and the React frontend with Vite, Tailwind CSS, and React Router. It wired all the layers together and ensured the API and client were correctly connected from the start.

**2. Kanban Board and Drag-and-Drop Implementation**
Kiro implemented the complete Kanban board component using `@hello-pangea/dnd`. This included `DragDropContext`, `Droppable` column containers, and `Draggable` task cards. It wrote the `PATCH /api/tasks/:id/status` endpoint and connected the drag-end handler to optimistically update the UI while persisting the new status to MongoDB - with snapshot-based rollback on failure if the API call errors.

**3. API Development and Database Integration**
Kiro created all REST API endpoints across auth, projects, tasks, activity, and dashboard resources. It wrote a Mongoose aggregation pipeline in `projectController` to count tasks per project and attach counts to project cards. It also built the activity logging system that records every task mutation and membership change automatically.

**4. Debugging and Deployment Fixes**
When the app was crashing on startup, Kiro diagnosed root causes by reading all key files - identifying broken imports, middleware ordering issues, and a duplicate Tailwind class conflict on the board's search wrapper. It also resolved the CORS error blocking the deployed frontend from reaching the Render backend, and fixed the Netlify build pipeline (`netlify.toml` paths, missing dev dependency install).

**5. Component Development - Task Dialog and Project Cards**
Kiro built the full task create/edit dialog using React Hook Form and Zod. The dialog handles both create and edit modes from a single component, populates all fields from existing task data when editing, and calls the correct API endpoint based on mode.

### What I did myself

- **Fixed a bug Kiro introduced:** The delete-project flow navigated to `/projects` before closing the confirmation modal, leaving the modal mounted during the route transition. I identified this from the reviewer's feedback and applied the fix myself by moving `setDeleteConfirm(false)` before the `navigate()` call.
- **Made a deployment decision:** I chose Netlify for the frontend and Render for the backend specifically because both have free tiers that support automatic GitHub deploys, making it easy to keep the live site in sync with the repo without manual uploads.
- **Reviewed and can explain the drag-and-drop rollback:** When a task is dragged to a new column, the UI updates instantly (optimistic update). A snapshot of the previous task list is saved before the change. If the `PATCH /api/tasks/:id/status` API call fails, the snapshot is restored so the board reverts to its previous state. This prevents the UI from showing a status that was never saved to the database.

---

## Project Structure

```
TeamForge/
├── client/                   # Vite + React frontend
│   ├── src/
│   │   ├── api/              # Axios wrappers per resource
│   │   ├── components/       # Board, TaskDialog, Layout, ProtectedRoute
│   │   ├── context/          # AuthContext (JWT storage + user state)
│   │   ├── lib/              # axios.js (interceptors), utils.js
│   │   └── pages/            # DashboardPage, ProjectsPage, ProjectDetailPage
│   ├── .env.example
│   └── vite.config.js
├── server/                   # Express + Mongoose backend
│   └── src/
│       ├── controllers/      # projectController, taskController, authController
│       ├── middleware/        # authMiddleware, errorHandler, validate, projectAccess
│       ├── models/           # Project, Task, User, Activity
│       ├── routes/           # projects, tasks, auth, dashboard, activity
│       ├── scripts/          # seed.js
│       └── validators/       # Zod schemas
│   └── .env.example
├── netlify.toml              # Netlify build configuration
├── package.json              # Root: concurrently dev script
└── README.md
```

---

## API Reference

All endpoints except `/api/auth/register` and `/api/auth/login` require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new account |
| `POST` | `/api/auth/login` | Log in, receive a JWT |
| `GET` | `/api/auth/me` | Get the current authenticated user |
| `GET` | `/api/projects` | List projects for the current user |
| `POST` | `/api/projects` | Create a project |
| `GET` | `/api/projects/:id` | Get project details with members |
| `PUT` | `/api/projects/:id` | Update project name / description |
| `DELETE` | `/api/projects/:id` | Delete project and all its tasks |
| `POST` | `/api/projects/:id/members` | Add a member by email |
| `DELETE` | `/api/projects/:id/members/:userId` | Remove a member by userId |
| `GET` | `/api/projects/:id/tasks` | List tasks for a project |
| `POST` | `/api/projects/:id/tasks` | Create a task |
| `PUT` | `/api/tasks/:id` | Update a task |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `PATCH` | `/api/tasks/:id/status` | Update task status (drag-and-drop) |
| `GET` | `/api/projects/:id/activity` | Fetch project activity log |
| `GET` | `/api/dashboard` | Get personal stats and assigned tasks |
