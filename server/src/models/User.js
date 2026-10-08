import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 100, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, maxlength: 254, trim: true },
    password: { type: String, required: true, minlength: 8, maxlength: 128, select: false },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
