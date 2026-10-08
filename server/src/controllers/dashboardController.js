import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Projects where user is a member
  const projects = await Project.find({ 'members.user': userId }).select('_id');
  const projectIds = projects.map((p) => p._id);

  const [totalTasks, statusCounts, assignedTasks, dueSoonTasks, recentActivity] =
    await Promise.all([
      Task.countDocuments({ project: { $in: projectIds } }),
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.find({ project: { $in: projectIds }, assignee: userId })
        .populate('assignee', 'name email')
        .populate('project', 'name')
        .sort({ dueDate: 1 })
        .limit(20),
      Task.find({
        project: { $in: projectIds },
        assignee: userId,
        dueDate: { $gte: now, $lte: in7Days },
      })
        .populate('project', 'name')
        .sort({ dueDate: 1 })
        .limit(10),
      Activity.find({ project: { $in: projectIds } })
        .populate('user', 'name')
        .populate('task', 'title')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

  const statusMap = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 };
  statusCounts.forEach(({ _id, count }) => { statusMap[_id] = count; });

  res.json({
    totalProjects: projects.length,
    totalTasks,
    statusCounts: statusMap,
    assignedTasks,
    dueSoonTasks,
    recentActivity,
  });
});
