import express from "express";
import helmet from "helmet";
import cors from "cors";
import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import projectsRouter from "./routes/projects.js";
import tasksRouter from "./routes/tasks.js";
import activityRouter from "./routes/activity.js";
import dashboardRouter from "./routes/dashboard.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Allow any localhost origin (any port) for local dev + configured CLIENT_URL
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps)
      if (!origin) return callback(null, true);
      const allowed =
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        origin === process.env.CLIENT_URL;
      if (allowed) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api", tasksRouter);
app.use("/api", activityRouter);
app.use("/api/dashboard", dashboardRouter);

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Central error handler (must be last)
app.use(errorHandler);

export default app;
