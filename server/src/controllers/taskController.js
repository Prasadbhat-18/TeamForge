import Task from "../models/Task.js";
import Activity from "../models/Activity.js";
import Project from "../models/Project.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getTasks = asyncHandler(async (req, res) => {
  const { search, status, priority, assignee } = req.query;
  const filter = { project: req.params.id };

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignee) filter.assignee = assignee;

  const tasks = await Task.find(filter)
    .populate("assignee", "name email")
    .sort({ position: 1 });
  res.json(tasks);
});

export const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, assignee, dueDate } = req.body;

  // Validate assignee is a project member if provided
  if (assignee) {
    const isMember = req.project.members.some(
      (m) => m.user._id.toString() === assignee
    );
    if (!isMember) {
      return res.status(400).json({ message: "Assignee must be a project member" });
    }
  }

  // Position = max in that column + 1 (default 1)
  const maxTask = await Task.findOne({ project: req.params.id, status })
    .sort({ position: -1 })
    .select("position");
  const position = maxTask ? maxTask.position + 1 : 1;

  const task = await Task.create({
    title,
    description: description || "",
    status,
    priority,
    assignee: assignee || null,
    dueDate: dueDate || null,
    position,
    project: req.params.id,
  });

  await Activity.create({
    project: req.params.id,
    user: req.user._id,
    action: "task created",
    task: task._id,
  });

  await task.populate("assignee", "name email");
  res.status(201).json(task);
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    const err = new Error("Task not found");
    err.status = 404;
    throw err;
  }

  // Validate new assignee if provided (non-empty)
  const newAssignee = req.body.assignee || null;
  if (newAssignee) {
    const project = await Project.findById(task.project).populate("members.user", "_id");
    const isMember =
      project && project.members.some((m) => m.user._id.toString() === newAssignee);
    if (!isMember) {
      return res.status(400).json({ message: "Assignee must be a project member" });
    }
  }

  const prevAssignee = task.assignee?.toString() || null;

  // Update fields — sanitise empty strings to null
  if (req.body.title !== undefined) task.title = req.body.title;
  if (req.body.description !== undefined) task.description = req.body.description;
  if (req.body.status !== undefined) task.status = req.body.status;
  if (req.body.priority !== undefined) task.priority = req.body.priority;
  task.assignee = newAssignee;
  task.dueDate = req.body.dueDate || null;

  await task.save();

  // Log activity if assignee changed
  if (prevAssignee !== (task.assignee?.toString() || null)) {
    await Activity.create({
      project: task.project,
      user: req.user._id,
      action: "task assigned",
      task: task._id,
    });
  }

  await task.populate("assignee", "name email");
  res.json(task);
});

export const patchTaskStatus = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    const err = new Error("Task not found");
    err.status = 404;
    throw err;
  }

  const { status, position } = req.body;
  const prevStatus = task.status;

  task.status = status;
  task.position = position;
  await task.save();

  // Re-sequence other tasks in the destination column to keep positions contiguous
  const columnTasks = await Task.find({
    project: task.project,
    status,
    _id: { $ne: task._id },
  }).sort({ position: 1 });

  for (let i = 0; i < columnTasks.length; i++) {
    const desiredPos = i < position - 1 ? i + 1 : i + 2;
    if (columnTasks[i].position !== desiredPos) {
      columnTasks[i].position = desiredPos;
      await columnTasks[i].save();
    }
  }

  if (prevStatus !== status) {
    await Activity.create({
      project: task.project,
      user: req.user._id,
      action: "task status changed",
      task: task._id,
    });
  }

  await task.populate("assignee", "name email");
  res.json(task);
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    const err = new Error("Task not found");
    err.status = 404;
    throw err;
  }
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task deleted" });
});
