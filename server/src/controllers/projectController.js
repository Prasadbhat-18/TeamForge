import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const project = await Project.create({
    name,
    description,
    owner: req.user._id,
    members: [{ user: req.user._id, role: 'owner' }],
  });
  await project.populate('owner', 'name email');
  await project.populate('members.user', 'name email');
  res.status(201).json(project);
});

export const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ 'members.user': req.user._id })
    .populate('owner', 'name email')
    .populate('members.user', 'name email')
    .sort({ createdAt: -1 });
  res.json(projects);
});

export const getProject = asyncHandler(async (req, res) => {
  res.json(req.project);
});

export const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (name !== undefined) req.project.name = name;
  if (description !== undefined) req.project.description = description;
  await req.project.save();
  res.json(req.project);
});

export const deleteProject = asyncHandler(async (req, res) => {
  const projectId = req.project._id;
  await Task.deleteMany({ project: projectId });
  await Activity.deleteMany({ project: projectId });
  await Project.findByIdAndDelete(projectId);
  res.json({ message: 'Project deleted' });
});

export const addMember = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const userToAdd = await User.findOne({ email });
  if (!userToAdd) {
    const err = new Error('User not found'); err.status = 404; throw err;
  }
  const alreadyMember = req.project.members.some(
    (m) => m.user._id.toString() === userToAdd._id.toString()
  );
  if (alreadyMember) {
    const err = new Error('User is already a member'); err.status = 409; throw err;
  }
  req.project.members.push({ user: userToAdd._id, role: 'member' });
  await req.project.save();
  await Activity.create({ project: req.project._id, user: req.user._id, action: 'member added' });
  await req.project.populate('members.user', 'name email');
  res.json(req.project);
});

export const removeMember = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: 'Invalid ID' });
  }
  if (userId === req.project.owner._id.toString()) {
    return res.status(400).json({ message: 'Cannot remove the project owner' });
  }
  req.project.members = req.project.members.filter(
    (m) => m.user._id.toString() !== userId
  );
  await req.project.save();
  await req.project.populate('members.user', 'name email');
  res.json(req.project);
});
