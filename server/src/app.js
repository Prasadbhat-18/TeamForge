import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import projectsRouter from './routes/projects.js';
import tasksRouter from './routes/tasks.js';
import activityRouter from './routes/activity.js';
import dashboardRouter from './routes/dashboard.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api', tasksRouter);
app.use('/api', activityRouter);
app.use('/api/dashboard', dashboardRouter);

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Central error handler (must be last)
app.use(errorHandler);

export default app;
