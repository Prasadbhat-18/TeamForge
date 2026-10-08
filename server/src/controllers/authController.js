import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already in use');
    err.status = 409;
    throw err;
  }
  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashed });
  const token = signToken(user._id);
  res.status(201).json({
    token,
    user: { _id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const token = signToken(user._id);
  res.json({
    token,
    user: { _id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  res.json({ _id: user._id, name: user.name, email: user.email, createdAt: user.createdAt });
});
