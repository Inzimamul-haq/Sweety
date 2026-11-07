import { AppError } from '../shared/errors/AppError.js';

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const payload = source === 'query' ? req.query : req.body;
    const result = schema.safeParse(payload);

    if (!result.success) {
      const issue = result.error.issues[0];
      const field = issue.path.length ? String(issue.path[0]) : null;
      next(new AppError(400, issue.message, field));
      return;
    }

    req.validated = result.data;
    next();
  };
}
