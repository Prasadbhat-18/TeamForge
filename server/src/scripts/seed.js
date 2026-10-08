import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

// Load .env from server root (works whether run from root or server/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../.env");

const { config } = await import("dotenv");
config({ path: envPath });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Activity from "../models/Activity.js";

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not set. Check your .env file at:", envPath);
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  console.log("Connected to MongoDB");

  await User.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});
  await Activity.deleteMany({});
  console.log("Cleared existing data");

  const [u1, u2] = await User.create([
    { name: "Demo User 1", email: "demo1@taskforge.dev", password: await bcrypt.hash("Demo@1234", 12) },
    { name: "Demo User 2", email: "demo2@taskforge.dev", password: await bcrypt.hash("Demo@1234", 12) },
  ]);

  const project = await Project.create({
    name: "TaskForge Demo Project",
    description: "A sample project with realistic tasks to explore the app",
    owner: u1._id,
    members: [
      { user: u1._id, role: "owner" },
      { user: u2._id, role: "member" },
    ],
  });

  const now = Date.now();
  const day = 864e5;
  const taskDefs = [
    { title: "Set up CI/CD pipeline",              status: "DONE",        priority: "HIGH",   position: 1, assignee: u1._id, dueDate: new Date(now - 5 * day) },
    { title: "Design database schema",             status: "DONE",        priority: "HIGH",   position: 2, assignee: u2._id, dueDate: new Date(now - 4 * day) },
    { title: "Implement authentication API",       status: "DONE",        priority: "HIGH",   position: 3, assignee: u1._id },
    { title: "Build project CRUD endpoints",       status: "IN_PROGRESS", priority: "HIGH",   position: 1, assignee: u1._id, dueDate: new Date(now + 2 * day) },
    { title: "Create Kanban board UI",             status: "IN_PROGRESS", priority: "MEDIUM", position: 2, assignee: u2._id, dueDate: new Date(now + 3 * day) },
    { title: "Add drag-and-drop support",          status: "IN_PROGRESS", priority: "MEDIUM", position: 3, assignee: u2._id },
    { title: "Write API documentation",            status: "REVIEW",      priority: "LOW",    position: 1, assignee: u1._id },
    { title: "Implement activity feed",            status: "REVIEW",      priority: "MEDIUM", position: 2, assignee: u2._id, dueDate: new Date(now + 5 * day) },
    { title: "Add email notifications",            status: "TODO",        priority: "LOW",    position: 1, assignee: u2._id },
    { title: "Deploy to production",               status: "TODO",        priority: "HIGH",   position: 2, assignee: u1._id, dueDate: new Date(now + 7 * day) },
    { title: "Performance optimization",           status: "TODO",        priority: "MEDIUM", position: 3 },
    { title: "Security audit",                     status: "TODO",        priority: "HIGH",   position: 4, assignee: u1._id, dueDate: new Date(now + 1 * day) },
  ];

  const created = await Task.insertMany(taskDefs.map((t) => ({ ...t, project: project._id })));

  await Activity.insertMany([
    { project: project._id, user: u1._id, action: "task created",        task: created[0]._id },
    { project: project._id, user: u2._id, action: "task created",        task: created[1]._id },
    { project: project._id, user: u1._id, action: "task status changed", task: created[0]._id },
    { project: project._id, user: u1._id, action: "member added" },
  ]);

  console.log(`\n✅  Seeded: 2 users, 1 project, ${created.length} tasks`);
  console.log("    demo1@taskforge.dev / Demo@1234  (owner)");
  console.log("    demo2@taskforge.dev / Demo@1234  (member)");
  await mongoose.disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });
