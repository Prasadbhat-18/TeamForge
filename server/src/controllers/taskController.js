import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getTasks = asyncHandler(async (req, res) => {
  const { search, status, priority, assignee } = req.query;
  const filter = { project: req.params.id };

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignee) filter.assignee = assignee;

  const tasks = await Task.find(filter)
    .populate('assignee', 'name email')
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
      return res.status(400).json({ message: 'Assignee must be a project member' });
    }
  }

  // Position = max in column + 1
  const maxTask = await Task.findOne({ project: req.params.id, status })
    .sort({ position: -1 })
    .select('position');
  const position = maxTask ? maxTask.position + 1 : 1;

  const task = await Task.create({
    title, description, status, priority,
    assignee: assignee || null,
    dueDate: dueDate || null,
    position,
    project: req.params.id,
  });

  await Activity.create({
    project: req.params.id,
    user: req.user._id,
    action: 'task created',
    task: task._id,
  });

  await task.populate('assignee', 'name email');
  res.status(201).json(task);
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) { const err = new Error('Task not found'); err.status = 404; throw err; }

  // Validate assignee if changing
  const { assignee } = req.body;
  if (assignee !== undefined && assignee !== null) {
    const isMember = req.project
      ? req.project.members.some((m) => m.user._id.toString() === assignee)
      : false;
    if (!isMember) {
      // Load project to check
      const Project = (await import('../models/Project.js')).default;
      const project = await Project.findById(task.project).populate('members.user', '_id');
      const ok = project && project.members.some((m) => m.user._id.toString() === assignee);
      if (!ok) return res.status(400).json({ message: 'Assignee must be a project member' });
    }
  }

  const prevAssignee = task.assignee?.toString();
  const fields = ['title', 'description', 'status', 'priority', 'assignee', 'dueDate'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) task[f] = req.body[f];
  });
  await task.save();

  // Log activity if assignee changed
  const newAssignee = task.assignee?.toString();
  if (prevAssignee !== newAssignee) {
    await Activity.create({
      project: task.project,
      user: req.user._id,
      action: 'task assigned',
      task: task._id,
    });
  }

  await task.populate('assignee', 'name email');
  res.json(task);
});

export const patchTaskStatus = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) { const err = new Error('Task not found'); err.status = 404; throw err; }

  const { status, position } = req.body;
  const prevStatus = task.status;

  task.status = status;
  task.position = position;
  await task.save();

  // Re-sequence all tasks in new column to ensure contiguous positions
  const columnTasks = await Task.find({
    project: task.project,
    status,
    _id: { $ne: task._id },
  }).sort({ position: 1 });

  const others = columnTasks.filter((t) => t.position >= position);
  for (let i = 0; i < columnTasks.length; i++) {
    const t = columnTasks[i];
    const desiredPos = i < position - 1 ? i + 1 : i + 2;
    if (t.position !== desiredPos) {
      t.position = desiredPos;
      await t.save();
    }
  }

  if (prevStatus !== status) {
    await Activity.create({
      project: task.project,
      user: req.user._id,
      action: 'task status changed',
      task: task._id,
    });
  }

  await task.populate('assignee', 'name email');
  res.json(task);
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) { const err = new Error('Task not found'); err.status = 404; throw err; }
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: 'Task deleted' });
});
