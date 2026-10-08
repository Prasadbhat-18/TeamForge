import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      required: true,
      enum: ['task created', 'task status changed', 'task assigned', 'member added'],
    },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
  },
  { timestamps: true }
);

activitySchema.index({ project: 1 });

export default mongoose.model('Activity', activitySchema);
