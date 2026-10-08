import Activity from '../models/Activity.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getActivity = asyncHandler(async (req, res) => {
  const activities = await Activity.find({ project: req.params.id })
    .populate('user', 'name')
    .populate('task', 'title')
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(activities);
});
