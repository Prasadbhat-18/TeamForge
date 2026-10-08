export const errorHandler = (err, req, res, next) => {
  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  // Handle Zod validation errors (passed from validate middleware)
  if (err.name === 'ZodError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  const body = { message };
  if (err.errors) body.errors = err.errors;

  res.status(status).json(body);
};
