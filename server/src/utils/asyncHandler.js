// Wraps async controllers so errors are forwarded to the central error handler
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
