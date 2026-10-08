import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 200, trim: true },
    description: { type: String, maxlength: 2000, trim: true, default: '' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'], required: true },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], required: true },
    dueDate: { type: Date, default: null },
    position: { type: Number, required: true, min: 0, max: 999999 },
  },
  { timestamps: true }
);

taskSchema.index({ project: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ assignee: 1 });

export default mongoose.model('Task', taskSchema);
