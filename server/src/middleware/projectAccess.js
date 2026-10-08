import mongoose from 'mongoose';
import Project from '../models/Project.js';

export const projectAccess = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = project.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );
    if (!isMember) return res.status(403).json({ message: 'Forbidden' });

    req.project = project;
    next();
  } catch (err) {
    next(err);
  }
};

export const ownerOnly = (req, res, next) => {
  if (req.project.owner._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};
