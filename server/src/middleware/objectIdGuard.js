import mongoose from 'mongoose';

/**
 * Middleware that checks req.params.id is a valid MongoDB ObjectId.
 * Returns 400 if not valid, so controllers never receive garbage IDs.
 */
export const objectIdGuard = (req, res, next) => {
  if (req.params.id && !mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID' });
  }
  if (req.params.userId && !mongoose.isValidObjectId(req.params.userId)) {
    return res.status(400).json({ message: 'Invalid ID' });
  }
  next();
};
