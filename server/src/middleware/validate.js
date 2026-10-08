import { ZodError } from 'zod';

/**
 * Validate req.body against a Zod schema.
 * On failure, calls next() with a structured ZodError so the central error
 * handler can format the 400 response.
 */
export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return next(err);
    }
    next(err);
  }
};

/**
 * Validate req.query against a Zod schema.
 */
export const validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = schema.parse(req.query);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return next(err);
    }
    next(err);
  }
};
